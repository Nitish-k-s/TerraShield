/**
 * GET /api/v1/statistics
 * Public API — requires TSK- API key
 * Returns district-level ecological intelligence
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-key";
import { getOverviewStats, getRiskDistribution, getTopDistricts, detectOutbreakClusters } from "@/lib/db/supabase-exif";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const auth = await verifyApiKey(req);
    if (!auth.valid) return NextResponse.json({ error: auth.error }, { status: 401 });

    const [overview, risk, top_districts, clusters] = await Promise.all([
        getOverviewStats(),
        getRiskDistribution(),
        getTopDistricts(),
        detectOutbreakClusters(),
    ]);

    return NextResponse.json({
        success: true,
        org: auth.org_name,
        data: { overview, risk_distribution: risk, top_districts, active_clusters: clusters },
        generated_at: new Date().toISOString(),
    });
}
