/**
 * POST /api/analyse-exif
 *
 * Retrieves EXIF records (including stored image bytes) from the local SQLite
 * database and sends them to Gemini Vision for ecological AI analysis.
 *
 * Key design principle:
 *   - EXIF metadata extraction is done by `exifr` in /api/extract-exif  ← NOT Gemini
 *   - Gemini receives the ACTUAL image pixels via multimodal inline data
 *   - EXIF context (GPS, device, timestamp) is provided alongside the image
 *     so Gemini has maximum ecological context without doing metadata work
 *
 * Request body (JSON):
 *   { "recordId": 5 }       → analyse a single specific record
 *   { "pending": true }     → analyse ALL rows where ai_analysed_at IS NULL
 *
 * Response (JSON):
 *   { success: true, analysed: [ { id, ai_label, ai_confidence, ai_risk_score, ai_summary, ai_tags } ] }
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildMemoryContext, retainSighting } from "@/lib/agent";
import {
    getExifById,
    getPendingAiAnalysis,
    updateAiAnalysis,
    ExifRecord,
} from "@/lib/db/supabase-exif";
import { getUserMeta, awardReportPoints } from "@/lib/db/supabase-users";
import { getUserFromRequest } from "@/lib/auth";
import { downloadReportImage } from "@/lib/storage";

export const runtime = "nodejs";

// ─── Gemini client (server-side only — key never exposed to browser) ──────────
function getGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "your_gemini_api_key_here") {
        throw new Error(
            "GEMINI_API_KEY is not set. Add it to .env.local and restart the dev server."
        );
    }
    return new GoogleGenerativeAI(key);
}

// ─── Retry helper (handles Gemini 429 / RESOURCE_EXHAUSTED) ──────────────────
function parseRetryDelay(err: unknown, defaultDelay = 60): number {
    const msg = err instanceof Error ? err.message : String(err);
    const match = msg.match(/retryDelay.*?(\d+)s/i) ?? msg.match(/retry.*?(\d+)/i);
    return match ? Math.min(120, parseInt(match[1], 10)) : defaultDelay;
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err: unknown) {
            lastErr = err;
            const msg = err instanceof Error ? err.message : String(err);
            const is429 = msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("RESOURCE_EXHAUSTED");
            if (!is429 || attempt === maxAttempts) throw err;
            const delay = parseRetryDelay(err, 60 * attempt);
            console.warn(`[analyse-exif] Rate-limited (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}s…`);
            await new Promise(r => setTimeout(r, delay * 1000));
        }
    }
    throw lastErr;
}

// ─── External Context Fetcher (Planet API) ───────────────────────────────────
async function fetchLocationContext(lat: number, lng: number): Promise<any> {
    const planetKey = process.env.PLANET_API_KEY;
    if (!planetKey) {
        console.warn("[analyse-exif] PLANET_API_KEY not set — skipping satellite context.");
        return null;
    }

    try {
        const { validateVegetationAnomaly } = await import("@/lib/sentinel");
        const result = await validateVegetationAnomaly(lat, lng);
        return {
            source: result.meta.source,
            coordinate: [lat, lng],
            vegetation_index_ndvi_30d_avg: result.current_ndvi,
            historical_ndvi: result.historical_ndvi,
            anomaly_score: result.anomaly_score,
            risk_level: result.risk_level,
            ecological_note: result.current_ndvi > 0.6
                ? "High vegetative density detected; high capacity for invasive plant spread."
                : "Low vegetative density or barren season detected.",
        };
    } catch (err) {
        console.warn("[analyse-exif] Planet satellite context failed:", err instanceof Error ? err.message : err);
        return null;
    }
}

// ─── Prompt builder ───────────────────────────────────────────────────────────
/**
 * Builds the TEXT portion of the multimodal prompt.
 * EXIF tags were already parsed by exifr — we include them here purely as
 * ecological context (location, time, device) so Gemini focuses on VISUAL
 * analysis rather than re-parsing raw metadata.
 */
function buildPrompt(record: ExifRecord, externalContext: any = null, memoryContext = "No previous sightings in agent memory for this area."): string {
    const contextJson = externalContext
        ? JSON.stringify(externalContext, null, 2)
        : "External satellite/weather context unavailable.";

    return `
## Agent Memory (past sightings recalled near this location)
${memoryContext}

You are TerraShield's ecological AI analyst. You are viewing a field image submitted
by a citizen observer for invasive species early-warning detection.

IMPORTANT — CLASSIFICATION INDEPENDENCE:
The observer may have selected an observation type (e.g. "Invasive Plant") before submitting.
You MUST ignore any such user-supplied classification entirely.
Your analysis must be based SOLELY on what you visually observe in the image and the
esatellite context below. Correct the user if their self-reported type is wrong.

## Capture Context (extracted prior to this call — do not re-parse metadata)
- Location  : ${record.latitude != null ? `${record.latitude}°, ${record.longitude}°` : "GPS not available"}
- Altitude  : ${record.altitude != null ? `${record.altitude} m above sea level` : "unknown"}
- Captured  : ${record.date_time ?? "unknown"}
- Device    : ${[record.make, record.model].filter(Boolean).join(" ") || "unknown"}
- Resolution: ${record.image_width && record.image_height ? `${record.image_width}×${record.image_height} px` : "unknown"}

## External Environmental Context (from Satellite/Sentinel API)
Use this data to cross-reference the visual signs of the environment. High moisture
might encourage certain invasive plants, while urban encroachment indicates human-aided spread.
\`\`\`json
${contextJson}
\`\`\`

## Your Task
Visually analyse the image above, taking into account the Capture Context and the 
External Environmental Context. Identify any plants, animals, or ecological conditions visible. 
Determine whether any species may be invasive or whether the landscape shows signs of 
ecological disturbance consistent with invasive spread.
Do NOT let the observer's self-selected category influence your label or risk score.

## CRITICAL — Species-Level Identification Guidelines
You MUST pay close attention to leaf morphology, texture, size, and growth pattern to 
distinguish between visually similar species. Common misidentifications to AVOID:

**Aquatic floating plants — distinguish carefully:**
- **Salvinia (Salvinia molesta / S. minima)**: Small (1–4 cm) oval/round leaves with a distinctive 
  FOLDED or cupped shape, HAIRY/fuzzy upper surface with egg-beater-shaped trichomes, leaves 
  arranged in PAIRS along a stem, no visible roots from above, forms dense chain-like mats.
- **Pistia stratiotes (Water Lettuce)**: Larger (5–15 cm) ROSETTE-shaped leaves, SPONGY and 
  ribbed texture with parallel veins, velvety but NOT hairy, forms individual rosettes NOT chains, 
  dangling feathery roots visible below.
- **Eichhornia crassipes (Water Hyacinth)**: Glossy rounded leaves with BULBOUS inflated petioles, 
  showy purple/lavender flowers when blooming, dark feathery roots.
- **Lemna / Wolffia (Duckweed)**: Tiny (1–10 mm) individual oval fronds, flat, no visible structure.

**Terrestrial invasive plants — distinguish carefully:**
- **Lantana camara**: Opposite rough-textured leaves, square stems, multi-colored flower clusters.
- **Prosopis juliflora (Mesquite)**: Thorny shrub/tree, bipinnate feathery leaves, yellow catkin flowers.
- **Parthenium hysterophorus**: Deeply lobed leaves, small white daisy-like flower heads, strong odor.

Always state the specific morphological features you observe that led to your identification.
If uncertain between two species, mention BOTH possibilities and explain the distinguishing 
features you see or cannot confirm.

You MUST respond with ONLY valid JSON matching this exact schema.
No markdown fences, no extra text — raw JSON only:

{
  "ai_label":      "<one of: 'invasive-plant' | 'invasive-animal' | 'deforestation' | 'wildfire' | 'urban-encroachment' | 'flood-risk' | 'normal-terrain' | 'unknown'>",
  "ai_confidence": <float 0.0–1.0, your confidence in the classification>,
  "ai_risk_score": <float 0.0–10.0, where 0 = no ecological risk, 10 = critical outbreak risk>,
  "ai_tags":       ["<identified species or condition>", "<habitat type>", "<spread severity>"],
  "ai_summary":    "<2–3 sentences describing the specific morphological features you observed, the species identified with reasoning, and ecological risk rationale based on the image and satellite context>"
}
`.trim();
}

// ─── Gemini multimodal call ───────────────────────────────────────────────────
interface GeminiResult {
    ai_label: string;
    ai_confidence: number;
    ai_risk_score: number;
    ai_tags: string[];
    ai_summary: string;
}
interface AnalysisMetadata {
    ai: GeminiResult;
    externalContext: any | null;
    pastSightings: any[];
    memorySummary: string;
    groqEnhanced: boolean;
}

async function analyseWithGemini(record: ExifRecord): Promise<AnalysisMetadata> {
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const generationConfig = { temperature: 0.2, maxOutputTokens: 2048 };

    // Fetch external geographical context if GPS coordinates exist
    let externalContext = null;
    if (record.latitude != null && record.longitude != null) {
        externalContext = await fetchLocationContext(record.latitude, record.longitude);
    }

    // ── Recall agent memory for this location ────────────────────────────────
    let memoryContext = "No previous sightings in agent memory for this area.";
    let pastSightings: any[] = [];
    let groqEnhanced = false;
    if (record.latitude != null && record.longitude != null) {
        try {
            const memory = await buildMemoryContext(record.latitude, record.longitude, record.filename);
            memoryContext = memory.summary;
            pastSightings = memory.pastSightings;
            groqEnhanced = memory.groqEnhanced;
        } catch (e) {
            console.warn("[analyse-exif] Memory recall failed:", e);
        }
    }

    const textPrompt = buildPrompt(record, externalContext, memoryContext);

    let result;

    if (record.image_storage_path) {
        // ── Multimodal path: download image from Supabase Storage + send to Gemini ────
        const imageBuffer = await downloadReportImage(record.image_storage_path);
        const base64Image = imageBuffer.toString("base64");

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: record.mime_type,   // e.g. "image/jpeg"
            },
        };

        // Order: [image, text] — model sees the image first, then instructions
        result = await withRetry(() =>
            model.generateContent({
                contents: [{ role: "user", parts: [imagePart, { text: textPrompt }] }],
                generationConfig,
            })
        );
    } else {
        // ── Text-only fallback for records uploaded before storage migration ─
        console.warn(`[analyse-exif] Record ${record.id} has no stored image — falling back to metadata-only analysis.`);
        result = await withRetry(() =>
            model.generateContent({
                contents: [{ role: "user", parts: [{ text: textPrompt }] }],
                generationConfig,
            })
        );
    }

    const text = result.response.text().trim();

    // Strip accidental markdown fences if model wraps output in ```json … ```
    const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    if (!clean) {
        throw new Error(
            "Gemini returned an empty response. The image may be too large or the model timed out. " +
            "Please try again with a smaller image."
        );
    }

    let parsed: GeminiResult;
    try {
        parsed = JSON.parse(clean);
    } catch {
        console.error("[analyse-exif] Gemini raw response (unparseable):", clean.slice(0, 300));
        throw new Error(
            "Gemini response was not valid JSON. This can happen if the model output was truncated. " +
            `Raw start: ${clean.slice(0, 80)}`
        );
    }


    // Clamp values to valid ranges
    parsed.ai_confidence = Math.min(1, Math.max(0, Number(parsed.ai_confidence) || 0));
    parsed.ai_risk_score = Math.min(10, Math.max(0, Number(parsed.ai_risk_score) || 0));

    return { ai: parsed, externalContext, pastSightings, memorySummary: memoryContext, groqEnhanced };
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
    // 1. Auth guard
    const user = await getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    // 2. Determine which records to analyse
    let records: ExifRecord[] = [];

    try {
        const body = await req.json().catch(() => ({}));

        if (body.recordId) {
            const rec = await getExifById(Number(body.recordId));
            if (!rec) {
                return NextResponse.json(
                    { success: false, error: `Record ${body.recordId} not found.` },
                    { status: 404 }
                );
            }
            records = [rec];
        } else if (body.pending) {
            records = await getPendingAiAnalysis();
        } else {
            return NextResponse.json(
                { success: false, error: 'Provide { "recordId": <id> } or { "pending": true }.' },
                { status: 400 }
            );
        }
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Bad request.";
        return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    if (records.length === 0) {
        return NextResponse.json({ success: true, analysed: [], message: "No records to analyse." });
    }

    // 3. Analyse each record with Gemini Vision and persist results
    const analysed = [];
    const errors = [];

    for (const record of records) {
        try {
            const { ai, externalContext, pastSightings, memorySummary, groqEnhanced } = await analyseWithGemini(record);

            const ai_analysed_at = new Date().toISOString();

            await updateAiAnalysis(record.id, {
                ai_label: ai.ai_label,
                ai_confidence: ai.ai_confidence,
                ai_tags: ai.ai_tags,
                ai_summary: ai.ai_summary,
                ai_risk_score: ai.ai_risk_score,
                ai_analysed_at,
                satellite_context_json: externalContext ?? null,
            });

            // ── Retain in agent memory ────────────────────────────────────────
            if (record.latitude != null && record.longitude != null) {
                try {
                    await retainSighting(
                        record.latitude,
                        record.longitude,
                        record.district ?? null,
                        record.state ?? null,
                        ai.ai_label,
                        ai.ai_risk_score,
                        ai.ai_tags,
                        ai.ai_confidence
                    );
                } catch (e) {
                    console.warn("[analyse-exif] Memory retain failed:", e);
                }
            }

            // ── Award TerraPoints ─────────────────────────────────────────────
            await getUserMeta(user.id, user.email ?? "");

            const { pointsAwarded, updatedUser } = await awardReportPoints(
                user.id,
                record.id,
                ai.ai_label,
                ai.ai_confidence
            );

            analysed.push({
                id: record.id,
                filename: record.filename,
                ai_label: ai.ai_label,
                ai_confidence: ai.ai_confidence,
                ai_risk_score: ai.ai_risk_score,
                ai_summary: ai.ai_summary,
                ai_tags: ai.ai_tags,
                ai_analysed_at,
                used_vision: !!record.image_storage_path,
                points_awarded: pointsAwarded,
                updated_user: updatedUser,
                agentMemory: {
                    pastSightingsNearby: pastSightings.length,
                    summary: memorySummary,
                    groqEnhanced,
                },
            });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            console.error(`[analyse-exif] Record ${record.id} failed:`, msg);
            errors.push({ id: record.id, error: msg });
        }
    }

    return NextResponse.json(
        {
            success: errors.length === 0,
            analysed,
            errors: errors.length > 0 ? errors : undefined,
        },
        { status: 200 }
    );
}

// Reject non-POST
export async function GET(): Promise<NextResponse> {
    return NextResponse.json(
        { success: false, error: "Use POST with { recordId } or { pending: true }." },
        { status: 405 }
    );
}
