/**
 * GET /api/statistics[?country=X&state=Y&district=Z]
 *
 * District-Level Ecological Intelligence API.
 * All aggregation is SQL GROUP BY on the backend — nothing is computed in the frontend.
 *
 * Filter params (all optional):
 *   ?country=India&state=Maharashtra&district=Pune
 *
 * Accepts Bearer token or session cookie for auth.
 */
import { NextResponse, type NextRequest } from "next/server";
import {
    getDistrictDistribution,
    getOverviewStats,
    getRiskDistribution,
    detectOutbreakClusters,
    getDistrictList,
    getSpeciesByDistrict,
    getTopDistricts,
    getTimeTrends,
    getRecentAlerts,
    type DistrictFilter,
} from "@/lib/db/supabase-exif";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const filter: DistrictFilter = {
            country: searchParams.get("country") || undefined,
            state: searchParams.get("state") || undefined,
            district: searchParams.get("district") || undefined,
        };
        const hasFilter = !!(filter.country || filter.state || filter.district);

        const supabase = getSupabaseAdmin();
        const { count: totalUsers } = await supabase.from("users_meta").select("*", { count: "exact", head: true });

        const overview = await getOverviewStats(hasFilter ? filter : undefined);
        const risk_distribution = await getRiskDistribution(hasFilter ? filter : undefined);
        const district_list = await getDistrictList();
        const district_summary = await getDistrictDistribution();
        const species_by_district = await getSpeciesByDistrict();
        const top_districts = await getTopDistricts(filter.country ? { country: filter.country } : undefined);
        const time_trends = await getTimeTrends(hasFilter ? filter : undefined, 30);
        const alerts = await getRecentAlerts(hasFilter ? filter : undefined, 20);
        const clusters = await detectOutbreakClusters();

        let q = supabase.from("exif_data").select("ai_confidence, ai_risk_score").not("ai_analysed_at", "is", null);
        if (hasFilter && filter.country) q = q.eq("country", filter.country);
        if (hasFilter && filter.state) q = q.eq("state", filter.state);
        if (hasFilter && filter.district) q = q.eq("district", filter.district);
        const { data: scoreRows } = await q;
        const rows = scoreRows || [];
        const avgConf = rows.length > 0 ? rows.reduce((s, r) => s + (r.ai_confidence ?? 0), 0) / rows.length : 0;
        const avgRisk = rows.length > 0 ? rows.reduce((s, r) => s + (r.ai_risk_score ?? 0), 0) / rows.length : 0;

        return NextResponse.json({
            success: true,
            filter_active: hasFilter,
            total_users: totalUsers ?? 0,
            overview,
            risk_distribution,
            district_list,
            district_summary,
            species_by_district,
            top_districts,
            time_trends,
            alerts,
            clusters,
            outbreak_score_components: {
                avg_ai_confidence: Math.round(avgConf * 100),
                avg_risk_score: Math.round(avgRisk * 100) / 100,
                active_clusters: clusters.length,
            },
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unexpected error";
        console.error("[statistics] Error:", msg);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
