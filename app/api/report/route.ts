/**
 * POST /api/report
 *
 * Generates a downloadable TerraShield Ecological Risk Report PDF.
 *
 * Accepts structured JSON with species + AI + satellite data.
 * Calls Gemini API server-side → renders PDF via pdf-lib → streams the file.
 *
 * API key (GEMINI_API_KEY) is never exposed to the browser.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEcologicalReport } from "@/lib/gemini";
import { generatePdfReport } from "@/lib/pdf";
import type { EcologicalReportInput } from "@/lib/gemini";

export const runtime = "nodejs";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function resolveUser(req: NextRequest) {
    const supabase = await createClient();
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const { data } = await supabase.auth.getUser(token);
        return data?.user ?? null;
    }
    const { data } = await supabase.auth.getUser();
    return data?.user ?? null;
}

// ─── Input validator ──────────────────────────────────────────────────────────

function validateInput(body: unknown): { valid: true; data: EcologicalReportInput } | { valid: false; error: string } {
    if (!body || typeof body !== "object") {
        return { valid: false, error: "Request body must be a JSON object." };
    }

    const b = body as Record<string, unknown>;

    const species = String(b.species ?? "").trim();
    if (!species) return { valid: false, error: '"species" is required.' };

    const ai_confidence = Number(b.ai_confidence ?? 0);
    const latitude = Number(b.latitude ?? NaN);
    const longitude = Number(b.longitude ?? NaN);
    const cluster_density = Number(b.cluster_density ?? 0);
    const current_ndvi = Number(b.current_ndvi ?? NaN);
    const historical_ndvi = Number(b.historical_ndvi ?? NaN);
    const anomaly_score = Number(b.anomaly_score ?? NaN);
    const risk_level = String(b.risk_level ?? "").trim();

    if (!isFinite(latitude) || Math.abs(latitude) > 90) return { valid: false, error: '"latitude" must be in range -90 to 90.' };
    if (!isFinite(longitude) || Math.abs(longitude) > 180) return { valid: false, error: '"longitude" must be in range -180 to 180.' };
    if (!isFinite(current_ndvi)) return { valid: false, error: '"current_ndvi" must be a number.' };
    if (!isFinite(historical_ndvi)) return { valid: false, error: '"historical_ndvi" must be a number.' };
    if (!isFinite(anomaly_score)) return { valid: false, error: '"anomaly_score" must be a number.' };
    if (!risk_level) return { valid: false, error: '"risk_level" is required.' };

    return {
        valid: true,
        data: {
            species,
            ai_confidence: Math.min(Math.max(ai_confidence, 0), 1),
            latitude,
            longitude,
            cluster_density: Math.max(Math.round(cluster_density), 0),
            current_ndvi,
            historical_ndvi,
            anomaly_score: Math.min(Math.max(anomaly_score, 0), 1),
            risk_level,
        },
    };
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
    // 1. Auth
    const user = await resolveUser(req);
    if (!user) {
        return NextResponse.json(
            { success: false, error: "Unauthorized. Please sign in." },
            { status: 401 }
        );
    }

    // 2. Parse body
    let rawBody: unknown;
    try {
        rawBody = await req.json();
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid JSON body." },
            { status: 400 }
        );
    }

    // 3. Validate
    const validation = validateInput(rawBody);
    if (!validation.valid) {
        return NextResponse.json(
            { success: false, error: (validation as { valid: false; error: string }).error },
            { status: 400 }
        );
    }

    const input = (validation as { valid: true; data: EcologicalReportInput }).data;

    console.log(`[report] Generating report for "${input.species}" @ (${input.latitude}, ${input.longitude}) — user ${user.id}`);

    // 4. Call Gemini (server-side, key never leaves the server)
    let reportOutput;
    try {
        reportOutput = await generateEcologicalReport(input);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Gemini API error.";
        console.error("[report] Gemini failed:", msg);
        return NextResponse.json(
            { success: false, error: `Report generation failed: ${msg}` },
            { status: 502 }
        );
    }

    // 5. Generate PDF
    let pdfBytes: Uint8Array;
    try {
        pdfBytes = await generatePdfReport({ reportInput: input, reportOutput });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "PDF generation error.";
        console.error("[report] PDF generation failed:", msg);
        return NextResponse.json(
            { success: false, error: `PDF generation failed: ${msg}` },
            { status: 500 }
        );
    }

    // 6. Build a safe filename
    const safeSpecies = input.species.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `TerraShield_Report_${safeSpecies}_${dateStr}.pdf`;

    // 7. Stream the PDF file to the client
    return new NextResponse(Buffer.from(pdfBytes), {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": pdfBytes.byteLength.toString(),
            "Cache-Control": "no-store",
        },
    });
}

// ─── Unsupported methods ──────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
    return NextResponse.json(
        { success: false, error: "Method not allowed. POST with { species, ai_confidence, latitude, longitude, cluster_density, current_ndvi, historical_ndvi, anomaly_score, risk_level }." },
        { status: 405 }
    );
}
