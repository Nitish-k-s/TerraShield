/**
 * GET /api/statistics
 * Protected — requires auth.
 * Returns aggregated ecological intelligence stats from exif_data + users_meta.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getUsersDb } from "@/lib/db/users";
import { getPublicReports, detectOutbreakClusters } from "@/lib/db/exif";

export const runtime = "nodejs";

function systemRisk(criticalCount: number, elevatedCount: number): string {
    if (criticalCount > 0) return "Critical";
    if (elevatedCount > 0) return "Elevated";
    return "Monitoring";
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const db = getUsersDb();

        // ── Total reports (all time) ─────────────────────────────────────────
        const totalRow = db.prepare<[], { total: number }>(
            "SELECT COUNT(*) AS total FROM users_meta"
        ).get();
        const totalUsers = totalRow?.total ?? 0;

        // Pull stats from exif_data via the shared DB connection
        const { default: Database } = await import("better-sqlite3");
        const path = await import("path");
        const exifDbPath = path.join(process.cwd(), "lib", "db", "exif.db");
        const exifDb = new Database(exifDbPath, { readonly: true });

        // Total reports
        const totalReports = (exifDb.prepare<[], { n: number }>(
            "SELECT COUNT(*) AS n FROM exif_data WHERE ai_analysed_at IS NOT NULL"
        ).get()?.n) ?? 0;

        // Invasive vs non-invasive
        const invasiveCount = (exifDb.prepare<[], { n: number }>(
            "SELECT COUNT(*) AS n FROM exif_data WHERE ai_label IN ('invasive-plant','invasive-animal') AND ai_analysed_at IS NOT NULL"
        ).get()?.n) ?? 0;
        const nonInvasiveCount = totalReports - invasiveCount;
        const invasivePct = totalReports > 0 ? Math.round((invasiveCount / totalReports) * 100) : 0;

        // Last 30 days
        const cutoff30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const reports30d = (exifDb.prepare<[string], { n: number }>(
            "SELECT COUNT(*) AS n FROM exif_data WHERE ai_analysed_at IS NOT NULL AND created_at >= ?"
        ).get(cutoff30)?.n) ?? 0;

        // Daily report counts — last 7 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyReports: { day: string; count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dayStart = d.toISOString().slice(0, 10) + 'T00:00:00.000Z';
            const dayEnd = d.toISOString().slice(0, 10) + 'T23:59:59.999Z';
            const count = (exifDb.prepare<[string, string], { n: number }>(
                "SELECT COUNT(*) AS n FROM exif_data WHERE ai_analysed_at IS NOT NULL AND created_at >= ? AND created_at <= ?"
            ).get(dayStart, dayEnd)?.n) ?? 0;
            dailyReports.push({ day: days[d.getDay()], count });
        }

        // Top species — parse first tag from ai_tags
        const taggedRows = exifDb.prepare<[], { ai_tags: string }>(
            "SELECT ai_tags FROM exif_data WHERE ai_label IN ('invasive-plant','invasive-animal') AND ai_tags IS NOT NULL AND ai_analysed_at IS NOT NULL"
        ).all();

        const speciesMap = new Map<string, number>();
        for (const row of taggedRows) {
            try {
                const tags: string[] = JSON.parse(row.ai_tags);
                const sp = tags.find(t => /^[A-Z]/.test(t) || t.includes(' ')) ?? tags[0];
                if (sp) speciesMap.set(sp, (speciesMap.get(sp) ?? 0) + 1);
            } catch { /* skip */ }
        }
        const topSpeciesSorted = [...speciesMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        const maxSpeciesCount = topSpeciesSorted[0]?.[1] ?? 1;
        const topSpecies = topSpeciesSorted.map(([species, count]) => ({
            species,
            count,
            pct: Math.round((count / maxSpeciesCount) * 100),
        }));

        exifDb.close();

        // Clusters from existing logic
        const clusters = detectOutbreakClusters();
        const criticalCount = clusters.filter(c => c.level === 'critical').length;
        const elevatedCount = clusters.filter(c => c.level === 'elevated').length;

        return NextResponse.json({
            success: true,
            total_reports: totalReports,
            invasive_count: invasiveCount,
            non_invasive_count: nonInvasiveCount,
            invasive_pct: invasivePct,
            total_reports_30d: reports30d,
            active_clusters: clusters.length,
            system_risk: systemRisk(criticalCount, elevatedCount),
            daily_reports: dailyReports,
            top_species: topSpecies,
            clusters,
            total_users: totalUsers,
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unexpected error";
        console.error("[statistics]", msg);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
