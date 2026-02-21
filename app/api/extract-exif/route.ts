/**
 * POST /api/extract-exif
 *
 * Accepts a multipart/form-data request containing an image file (field: "image").
 * Returns the EXIF GPS data (latitude, longitude, altitude) and a broader set of
 * available EXIF tags from the uploaded image.
 *
 * Libraries used:
 *  - exifr  : fast, modern EXIF parser (supports JPEG, HEIC, TIFF, PNG, WebP …)
 *  - formidable : streaming multipart parser for Node.js / Next.js
 */

import { NextRequest, NextResponse } from "next/server";
import { IncomingMessage } from "http";
import { Readable } from "stream";
import formidable, { File } from "formidable";
import * as fs from "fs";
import exifr from "exifr";
import { createClient } from "@/lib/supabase/server";
import { insertExifRecord, updateExifDistrict } from "@/lib/db/exif";

// ─── Disable the built-in Next.js body parser for this route ─────────────────
// (Next.js App Router does NOT automatically parse multipart bodies, so we
//  parse the raw request stream ourselves with formidable.)
export const runtime = "nodejs"; // make sure this runs in Node, not the Edge runtime

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GpsCoordinates {
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
    latitudeRef: string | null;
    longitudeRef: string | null;
}

export interface ExifResponse {
    success: boolean;
    /** Auto-generated local DB record id (present on successful saves) */
    recordId?: number;
    filename: string;
    mimeType: string;
    gps: GpsCoordinates;
    /** A flat map of every EXIF tag exifr could read from the file */
    allTags: Record<string, unknown>;
    /** Human-readable Google Maps URL, or null when GPS data is absent */
    mapsUrl: string | null;
    error?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converts a Next.js Request (Web Streams API) into a Node.js IncomingMessage
 * so that formidable can parse it.
 */
async function requestToNodeIncoming(req: NextRequest): Promise<IncomingMessage> {
    const body = await req.arrayBuffer();
    const readable = new Readable();
    readable.push(Buffer.from(body));
    readable.push(null);

    const incoming = readable as unknown as IncomingMessage;
    // Copy the headers formidable needs
    incoming.headers = Object.fromEntries(req.headers.entries());
    return incoming;
}

/**
 * Wraps formidable's callback-based parse() in a Promise.
 */
function parseForm(
    req: IncomingMessage
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
    const form = formidable({
        maxFileSize: 50 * 1024 * 1024, // 50 MB upper limit
        keepExtensions: true,
        multiples: false,
    });

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });
}

/**
 * Builds a Google Maps link from lat/lng coordinates.
 */
function buildMapsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<ExifResponse>> {
    try {
        // 0. Auth guard — reject unauthenticated requests
        const authHeader = req.headers.get('authorization');
        let user = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const supabase = await createClient();

            // Supabase API requires `getUser(jwt)` for custom tokens
            const { data, error } = await supabase.auth.getUser(token);
            if (error) console.error("[extract-exif] Token validation error:", error);
            user = data?.user || null;
        } else {
            // Fallback to cookie-based session
            const supabase = await createClient();
            const { data } = await supabase.auth.getUser();
            user = data?.user || null;
        }

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    filename: "",
                    mimeType: "",
                    gps: { latitude: null, longitude: null, altitude: null, latitudeRef: null, longitudeRef: null },
                    allTags: {},
                    mapsUrl: null,
                    error: "Unauthorized. Please sign in.",
                },
                { status: 401 }
            );
        }

        // 1. Convert Web Request → Node IncomingMessage so formidable can parse it
        const nodeReq = await requestToNodeIncoming(req);

        // 2. Parse the multipart body
        const { fields, files } = await parseForm(nodeReq);

        // Read the optional manually-entered observation date (ISO yyyy-mm-dd)
        const rawObservedDate = fields['observed_date'];
        const observedDate: string | null = Array.isArray(rawObservedDate)
            ? (rawObservedDate[0] ?? null)
            : (rawObservedDate ?? null);

        // 3. Pull out the uploaded file (field name: "image")
        const rawFile = files["image"];
        if (!rawFile) {
            return NextResponse.json(
                {
                    success: false,
                    filename: "",
                    mimeType: "",
                    gps: { latitude: null, longitude: null, altitude: null, latitudeRef: null, longitudeRef: null },
                    allTags: {},
                    mapsUrl: null,
                    error: 'No file found. Make sure the form field name is "image".',
                },
                { status: 400 }
            );
        }

        // formidable v3 always returns an array for each field
        const file: File = Array.isArray(rawFile) ? rawFile[0] : rawFile;

        // 4. Read the file buffer from the temp location
        const buffer = fs.readFileSync(file.filepath);

        // 5. Extract EXIF data with exifr
        //    We ask for ALL tags so callers can inspect the full metadata payload.
        const allTags: Record<string, unknown> = (await exifr.parse(buffer, {
            tiff: true,
            xmp: true,
            icc: true,
            iptc: true,
            jfif: true,
            ihdr: true,
            // Ask specifically for GPS IFD
            gps: true,
        })) ?? {};

        // 6. Extract GPS fields specifically (exifr normalises them to decimal degrees)
        const gpsData = await exifr.gps(buffer).catch(() => null);

        const gps: GpsCoordinates = {
            latitude: gpsData?.latitude ?? (allTags["latitude"] as number) ?? null,
            longitude: gpsData?.longitude ?? (allTags["longitude"] as number) ?? null,
            altitude: (allTags["GPSAltitude"] as number) ?? null,
            latitudeRef: (allTags["GPSLatitudeRef"] as string) ?? null,
            longitudeRef: (allTags["GPSLongitudeRef"] as string) ?? null,
        };

        const mapsUrl =
            gps.latitude !== null && gps.longitude !== null
                ? buildMapsUrl(gps.latitude, gps.longitude)
                : null;

        // ── SQLite type sanitizers ────────────────────────────────────────────
        // exifr returns Date objects, fraction objects {numerator,denominator},
        // booleans, and plain objects. SQLite only accepts: string | number | bigint | Buffer | null.
        const toSafeStr = (v: unknown): string | null => {
            if (v === undefined || v === null) return null;
            if (v instanceof Date) return v.toISOString();
            if (typeof v === 'string') return v;
            if (typeof v === 'number' || typeof v === 'bigint') return String(v);
            if (typeof v === 'boolean') return null; // boolean has no useful string form for EXIF
            if (typeof v === 'object') return JSON.stringify(v); // Flash objects etc → JSON string
            return null;
        };
        const toSafeNum = (v: unknown): number | null => {
            if (v === undefined || v === null) return null;
            if (typeof v === 'number' && isFinite(v)) return v;
            if (typeof v === 'bigint') return Number(v);
            if (typeof v === 'boolean') return null;
            // exifr Fraction objects: { numerator: 1, denominator: 100 }
            if (typeof v === 'object' && v !== null && 'numerator' in v && 'denominator' in v) {
                const o = v as { numerator: number; denominator: number };
                return o.denominator !== 0 ? o.numerator / o.denominator : null;
            }
            if (typeof v === 'string') { const n = parseFloat(v); return isFinite(n) ? n : null; }
            return null;
        };
        const toSafeDate = (v: unknown): string | null => {
            if (v instanceof Date) return v.toISOString();
            if (typeof v === 'string' && v.trim()) return v;
            return null;
        };

        // 7. Persist to local SQLite database (insert FIRST — district added below via UPDATE)
        //    District columns are guaranteed to exist from the migration in getDb().
        //    We delete the temp file AFTER the insert so the buffer is safely saved.
        const recordId = insertExifRecord({
            user_id: user.id,
            filename: file.originalFilename ?? "unknown",
            mime_type: file.mimetype ?? "application/octet-stream",
            file_size_bytes: typeof file.size === 'number' ? file.size : null,

            // GPS — already number | null from exifr.gps()
            latitude: gps.latitude,
            longitude: gps.longitude,
            altitude: toSafeNum(gps.altitude),
            latitude_ref: toSafeStr(gps.latitudeRef),
            longitude_ref: toSafeStr(gps.longitudeRef),
            maps_url: mapsUrl,

            // Camera / device — exifr can return Date, Fraction, bool, object
            make: toSafeStr(allTags["Make"]),
            model: toSafeStr(allTags["Model"]),
            software: toSafeStr(allTags["Software"]),
            date_time: toSafeDate(allTags["DateTimeOriginal"])
                ?? toSafeDate(allTags["DateTime"])
                ?? observedDate
                ?? null,
            exposure_time: toSafeNum(allTags["ExposureTime"]) !== null
                ? String(toSafeNum(allTags["ExposureTime"]))
                : null,
            f_number: toSafeNum(allTags["FNumber"]),
            iso: toSafeNum(allTags["ISO"]),
            focal_length: toSafeNum(allTags["FocalLength"]),
            // Flash is an object like {fired:false, mode:0, ...} — store as JSON string
            flash: toSafeStr(allTags["Flash"]),

            // Image properties
            image_width: toSafeNum(allTags["ImageWidth"]),
            image_height: toSafeNum(allTags["ImageHeight"]),
            orientation: toSafeNum(allTags["Orientation"]),
            // ColorSpace is often a number (e.g. 1 = sRGB) — convert to string label
            color_space: toSafeStr(allTags["ColorSpace"]),

            // Full raw dump — JSON.stringify is always a string, safe
            all_tags_json: JSON.stringify(allTags),

            // Raw image bytes — Buffer is accepted by SQLite
            image_data: buffer,
        });


        // 7b. Reverse-geocode GPS → district / state / country (after insert, non-blocking)
        // District columns exist via migration in getDb(). Uses Nominatim OSM — free, no API key.
        if (gps.latitude !== null && gps.longitude !== null) {
            try {
                const controller = new AbortController();
                const geoTimeout = setTimeout(() => controller.abort(), 3000);
                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${gps.latitude}&lon=${gps.longitude}&format=json`,
                    {
                        signal: controller.signal,
                        headers: { 'User-Agent': 'TerraShield-App/1.0 (ecological intelligence platform)' },
                    }
                );
                clearTimeout(geoTimeout);
                if (geoRes.ok) {
                    const geo = await geoRes.json();
                    const addr = geo?.address ?? {};
                    const district = addr.county ?? addr.district ?? addr.suburb ?? addr.borough ?? null;
                    const state = addr.state ?? addr.province ?? null;
                    const country = addr.country ?? null;
                    // Write district onto the already-saved record
                    updateExifDistrict(recordId, district, state, country);
                }
            } catch {
                console.warn('[extract-exif] Nominatim geocoding skipped (timeout/offline)');
                // District stays NULL — report is already saved
            }
        }
        fs.unlinkSync(file.filepath);

        // 9. Return the structured response (include recordId for reference)
        return NextResponse.json(
            {
                success: true,
                recordId,
                filename: file.originalFilename ?? "unknown",
                mimeType: file.mimetype ?? "application/octet-stream",
                gps,
                allTags,
                mapsUrl,
            },
            { status: 200 }
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        console.error("[extract-exif] Error:", message);

        return NextResponse.json(
            {
                success: false,
                filename: "",
                mimeType: "",
                gps: { latitude: null, longitude: null, altitude: null, latitudeRef: null, longitudeRef: null },
                allTags: {},
                mapsUrl: null,
                error: message,
            },
            { status: 500 }
        );
    }
}

// Reject non-POST verbs with a helpful error
export async function GET(): Promise<NextResponse> {
    return NextResponse.json(
        { success: false, error: "Method not allowed. Use POST with multipart/form-data." },
        { status: 405 }
    );
}
