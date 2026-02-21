/**
 * GET /api/public-reports
 *
 * Public endpoint (no auth required) — returns:
 *   reports   : analysed invasive sightings for the last 30 days (map markers)
 *   clusters  : outbreak clusters detected by 5-km / 7-day Haversine grouping
 *
 * Exposes ONLY safe public fields. No user_id, email, or image data.
 */
import { NextResponse } from "next/server";
import { getPublicReports, detectOutbreakClusters } from "@/lib/db/exif";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
    try {
        const reports = getPublicReports();
        const clusters = detectOutbreakClusters();

        return NextResponse.json(
            { success: true, reports, clusters },
            {
                status: 200,
                headers: {
                    // Cache for 60 seconds — fresh enough for a live map, cheap enough to serve
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
                },
            }
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        console.error("[public-reports] Error:", message);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
