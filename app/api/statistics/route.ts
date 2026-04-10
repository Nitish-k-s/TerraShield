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
    getDb,
    getUsersDb,
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
} from "@/lib/db/sqlite-exif";

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

        const db = getDb();
        const usersDb = getUsersDb();
        const totalUsers = (usersDb.prepare<[], { total: number }>("SELECT COUNT(*) AS total FROM users_meta").get()?.total) ?? 0;

        const overview = getOverviewStats(hasFilter ? filter : undefined);
        const risk_distribution = getRiskDistribution(hasFilter ? filter : undefined);
        const district_list = getDistrictList();
        const district_summary = getDistrictDistribution();
        const species_by_district = getSpeciesByDistrict();
        const top_districts = getTopDistricts(filter.country ? { country: filter.country } : undefined);
        const time_trends = getTimeTrends(hasFilter ? filter : undefined, 30);
        const alerts = getRecentAlerts(hasFilter ? filter : undefined, 20);
        const clusters = detectOutbreakClusters();

        const clauses = ["ai_analysed_at IS NOT NULL"];
        const params: string[] = [];
        if (hasFilter && filter.country) { clauses.push("country = ?"); params.push(filter.country); }
        if (hasFilter && filter.state) { clauses.push("state = ?"); params.push(filter.state); }
        if (hasFilter && filter.district) { clauses.push("district = ?"); params.push(filter.district); }
        const scoreRow = db.prepare<string[], { conf: number; risk: number }>(
            `SELECT ROUND(AVG(COALESCE(ai_confidence,0)),3) AS conf, ROUND(AVG(COALESCE(ai_risk_score,0)),2) AS risk FROM exif_data WHERE ${clauses.join(" AND ")}`
        ).get(...params);

        return NextResponse.json({
            success: true,
            filter_active: hasFilter,
            total_users: totalUsers,
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
                avg_ai_confidence: Math.round((scoreRow?.conf ?? 0) * 100),
                avg_risk_score: scoreRow?.risk ?? 0,
                active_clusters: clusters.length,
            },
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unexpected error";
        console.error("[statistics] Error:", msg);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
