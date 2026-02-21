/**
 * POST /api/sentinel
 *
 * Satellite vegetation anomaly validation for TerraShield.
 *
 * Request body (JSON):
 *   { "latitude": 48.8584, "longitude": 2.2945 }
 *
 * Success response (200):
 *   {
 *     "current_ndvi":    0.64,
 *     "historical_ndvi": 0.42,
 *     "anomaly_score":   0.44,
 *     "risk_level":      "Moderate Vegetation Anomaly",
 *     "meta": { ... }
 *   }
 *
 * Error response (4xx / 5xx):
 *   { "success": false, "error": "Human-readable message" }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
    validateVegetationAnomaly,
    SentinelNoDataError,
} from "@/lib/sentinel";

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

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
    // 1. Authentication
    const user = await resolveUser(req);
    if (!user) {
        return NextResponse.json(
            { success: false, error: "Unauthorized. Please sign in." },
            { status: 401 }
        );
    }

    // 2. Parse + validate body
    let latitude: number;
    let longitude: number;

    try {
        const body = await req.json();

        latitude = Number(body.latitude ?? body.lat);
        longitude = Number(body.longitude ?? body.lng);

        if (!isFinite(latitude) || Math.abs(latitude) > 90) {
            throw new Error("latitude must be a number in range -90 to 90.");
        }
        if (!isFinite(longitude) || Math.abs(longitude) > 180) {
            throw new Error("longitude must be a number in range -180 to 180.");
        }
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Invalid JSON body.";
        return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    // 3. Run satellite validation (with caching inside the lib)
    try {
        console.log(`[sentinel] Validating (${latitude}, ${longitude}) for user ${user.id}`);

        const result = await validateVegetationAnomaly(latitude, longitude);

        // 4. Return the structured response the spec requires
        return NextResponse.json({
            current_ndvi: result.current_ndvi,
            historical_ndvi: result.historical_ndvi,
            anomaly_score: result.anomaly_score,
            risk_level: result.risk_level,
            // meta is optional but included for transparency / debugging
            meta: result.meta,
        }, { status: 200 });

    } catch (err: unknown) {
        // Cloud cover / no-data → 422 Unprocessable rather than 500
        if (err instanceof SentinelNoDataError) {
            console.warn("[sentinel] No-data error:", err.message);
            return NextResponse.json(
                { success: false, error: err.message },
                { status: 422 }
            );
        }

        // Sentinel Hub API auth or network failures
        const msg = err instanceof Error ? err.message : "Unexpected server error.";
        console.error("[sentinel] Error:", msg);
        return NextResponse.json(
            { success: false, error: msg },
            { status: 502 }
        );
    }
}

// ─── Unsupported methods ──────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
    return NextResponse.json(
        { success: false, error: "Method not allowed. Use POST with { latitude, longitude }." },
        { status: 405 }
    );
}
