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
import { createClient } from "@/lib/supabase/server";
import {
    getExifById,
    getPendingAiAnalysis,
    updateAiAnalysis,
    ExifRecord,
} from "@/lib/db/exif";

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

// ─── Prompt builder ───────────────────────────────────────────────────────────
/**
 * Builds the TEXT portion of the multimodal prompt.
 * EXIF tags were already parsed by exifr — we include them here purely as
 * ecological context (location, time, device) so Gemini focuses on VISUAL
 * analysis rather than re-parsing raw metadata.
 */
function buildPrompt(record: ExifRecord): string {
    return `
You are TerraShield's ecological AI analyst. You are viewing a field image submitted
by a citizen observer for invasive species early-warning detection.

## Capture Context (extracted prior to this call — do not re-parse metadata)
- Location  : ${record.latitude != null ? `${record.latitude}°, ${record.longitude}°` : "GPS not available"}
- Altitude  : ${record.altitude != null ? `${record.altitude} m above sea level` : "unknown"}
- Captured  : ${record.date_time ?? "unknown"}
- Device    : ${[record.make, record.model].filter(Boolean).join(" ") || "unknown"}
- Resolution: ${record.image_width && record.image_height ? `${record.image_width}×${record.image_height} px` : "unknown"}

## Your Task
Visually analyse the image above. Identify any plants, animals, or ecological
conditions visible. Determine whether any species may be invasive or whether the
landscape shows signs of ecological disturbance consistent with invasive spread.

You MUST respond with ONLY valid JSON matching this exact schema.
No markdown fences, no extra text — raw JSON only:

{
  "ai_label":      "<one of: 'invasive-plant' | 'invasive-animal' | 'deforestation' | 'wildfire' | 'urban-encroachment' | 'flood-risk' | 'normal-terrain' | 'unknown'>",
  "ai_confidence": <float 0.0–1.0, your confidence in the classification>,
  "ai_risk_score": <float 0.0–10.0, where 0 = no ecological risk, 10 = critical outbreak risk>,
  "ai_tags":       ["<identified species or condition>", "<habitat type>", "<spread severity>"],
  "ai_summary":    "<2–3 sentences: what you see visually, any species identified, ecological risk rationale>"
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

async function analyseWithGemini(record: ExifRecord): Promise<GeminiResult> {
    const genAI = getGemini();
    // gemini-1.5-flash supports multimodal (vision) input
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const textPrompt = buildPrompt(record);

    let result;

    if (record.image_data) {
        // ── Multimodal path: send actual image pixels + metadata context ────
        // better-sqlite3 returns BLOBs as Node.js Buffer objects; we convert
        // to base64 for the Gemini inline-data format.
        const base64Image = Buffer.from(record.image_data).toString("base64");

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: record.mime_type,   // e.g. "image/jpeg"
            },
        };

        // Order: [image, text] — model sees the image first, then instructions
        result = await model.generateContent([imagePart, { text: textPrompt }]);
    } else {
        // ── Text-only fallback for records uploaded before image_data was added ─
        console.warn(`[analyse-exif] Record ${record.id} has no stored image — falling back to metadata-only analysis.`);
        result = await model.generateContent(textPrompt);
    }

    const text = result.response.text().trim();

    // Strip accidental markdown fences if model wraps output in ```json … ```
    const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

    const parsed: GeminiResult = JSON.parse(clean);

    // Clamp values to valid ranges
    parsed.ai_confidence = Math.min(1, Math.max(0, Number(parsed.ai_confidence) || 0));
    parsed.ai_risk_score = Math.min(10, Math.max(0, Number(parsed.ai_risk_score) || 0));

    return parsed;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
    // 1. Auth guard
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    // 2. Determine which records to analyse
    let records: ExifRecord[] = [];

    try {
        const body = await req.json().catch(() => ({}));

        if (body.recordId) {
            // Single record by id
            const rec = getExifById(Number(body.recordId));
            if (!rec) {
                return NextResponse.json(
                    { success: false, error: `Record ${body.recordId} not found.` },
                    { status: 404 }
                );
            }
            records = [rec];
        } else if (body.pending) {
            // All rows not yet analysed
            records = getPendingAiAnalysis();
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
            const ai = await analyseWithGemini(record);

            const ai_analysed_at = new Date().toISOString();

            updateAiAnalysis(record.id, {
                ai_label: ai.ai_label,
                ai_confidence: ai.ai_confidence,
                ai_tags: JSON.stringify(ai.ai_tags),
                ai_summary: ai.ai_summary,
                ai_risk_score: ai.ai_risk_score,
                ai_analysed_at,
            });

            analysed.push({
                id: record.id,
                filename: record.filename,
                ai_label: ai.ai_label,
                ai_confidence: ai.ai_confidence,
                ai_risk_score: ai.ai_risk_score,
                ai_summary: ai.ai_summary,
                ai_tags: ai.ai_tags,
                ai_analysed_at,
                used_vision: !!record.image_data,   // helpful debug flag
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
