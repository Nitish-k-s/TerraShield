/**
 * GET /api/agent-memory/user
 * Returns all agent memories relevant to the authenticated user's reports
 */
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabase = getSupabaseAdmin();

        // Get user's analysed reports
        const { data: reports } = await supabase
            .from("exif_data")
            .select("id, filename, latitude, longitude, district, state, country, ai_label, ai_confidence, ai_risk_score, ai_tags, ai_summary, ai_analysed_at, created_at, image_storage_path")
            .eq("user_id", user.id)
            .not("ai_analysed_at", "is", null)
            .order("created_at", { ascending: false });

        // Get all memories from Supabase
        const { data: memories, count: totalMemories } = await supabase
            .from("agent_memories")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .limit(500);

        // For each report, find nearby memories
        const reportsWithMemory = (reports || []).map(report => {
            const nearbyMemories = report.latitude && report.longitude
                ? (memories || []).filter(m => {
                    if (!m.lat || !m.lng) return false;
                    return haversineKm(report.latitude!, report.longitude!, m.lat, m.lng) <= 50;
                }).slice(0, 5)
                : [];

            return {
                ...report,
                ai_tags: Array.isArray(report.ai_tags) ? report.ai_tags : [],
                nearbyMemories,
                memoryCount: nearbyMemories.length,
            };
        });

        return NextResponse.json({
            success: true,
            reports: reportsWithMemory,
            totalMemories: totalMemories ?? 0,
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Server error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
