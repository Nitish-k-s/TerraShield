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
import { getUsersDb } from "@/lib/db/users";
import {
    getDb,
    getDistrictList,
    getOverviewStats,
    getRiskDistribution,
    getSpeciesByDistrict,
    getTopDistricts,
    getTimeTrends,
    getRecentAlerts,
    getDistrictDistribution,
    detectOutbreakClusters,
    type DistrictFilter,
} from "@/lib/db/exif";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        // ── Trigger migration (idempotent) ────────────────────────────────────
        getDb();

        // ── Parse optional district filter from query params ──────────────────
        const { searchParams } = new URL(req.url);
        const filter: DistrictFilter = {
            country: searchParams.get("country") || undefined,
            state: searchParams.get("state") || undefined,
            district: searchParams.get("district") || undefined,
        };
        const hasFilter = !!(filter.country || filter.state || filter.district);

        // ── Users count ───────────────────────────────────────────────────────
        const usersDb = getUsersDb();
        const totalUsers = (usersDb.prepare<[], { total: number }>(
            "SELECT COUNT(*) AS total FROM users_meta"
        ).get()?.total) ?? 0;

        // ── All district-aware aggregations ───────────────────────────────────
        const overview = getOverviewStats(hasFilter ? filter : undefined);
        const risk_distribution = getRiskDistribution(hasFilter ? filter : undefined);
        const district_list = getDistrictList();
        const district_summary = getDistrictDistribution();
        const species_by_district = getSpeciesByDistrict();
        const top_districts = getTopDistricts(filter.country ? { country: filter.country } : undefined);
        const time_trends = getTimeTrends(hasFilter ? filter : undefined, 30);
        const alerts = getRecentAlerts(hasFilter ? filter : undefined, 20);
        const clusters = detectOutbreakClusters();

        // ── Outbreak confidence score components (district-aware average) ──────
        const db = getDb();
        const scoreComps = ((): { avg_ai_confidence: number; avg_risk_score: number; active_clusters: number } => {
            const clauses = ["ai_analysed_at IS NOT NULL"];
            const params: (string)[] = [];
            if (hasFilter && filter.country) { clauses.push("country = ?"); params.push(filter.country); }
            if (hasFilter && filter.state) { clauses.push("state = ?"); params.push(filter.state); }
            if (hasFilter && filter.district) { clauses.push("district = ?"); params.push(filter.district); }
            const row = db.prepare<string[], { conf: number; risk: number }>(
                `SELECT ROUND(AVG(COALESCE(ai_confidence,0)),3) AS conf,
                        ROUND(AVG(COALESCE(ai_risk_score,0)),2)  AS risk
                 FROM   exif_data WHERE ${clauses.join(" AND ")}`
            ).get(...params);
            return {
                avg_ai_confidence: Math.round((row?.conf ?? 0) * 100),
                avg_risk_score: row?.risk ?? 0,
                active_clusters: clusters.filter(c =>
                    !hasFilter || !filter.district ||
                    (c as { district?: string }).district === filter.district
                ).length,
            };
        })();

        console.log("[statistics] overview:", overview, "filter:", filter);

        return NextResponse.json({
            success: true,
            filter_active: hasFilter,
            total_users: totalUsers,

            // Overview (filter-aware)
            overview,

            // Risk donut (filter-aware)
            risk_distribution,

            // District data (global — for selector/matrix)
            district_list,
            district_summary,
            species_by_district,

            // Top districts bar chart
            top_districts,

            // Time trend line chart (filter-aware)
            time_trends,

            // Alert table (filter-aware)
            alerts,

            // Outbreak clusters (all, for map)
            clusters,

            // Confidence score breakdown
            outbreak_score_components: scoreComps,
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unexpected error";
        console.error("[statistics] Error:", msg, err);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
