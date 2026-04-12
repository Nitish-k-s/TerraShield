/**
 * GET /api/agent-memory
 * Returns agent memory stats for the home page panel
 */
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
    try {
        const supabase = getSupabaseAdmin();

        const { count: total } = await supabase
            .from("agent_memories")
            .select("*", { count: "exact", head: true });

        const { data: recent } = await supabase
            .from("agent_memories")
            .select("classification, district, state, risk_score, species, created_at")
            .order("created_at", { ascending: false })
            .limit(5);

        const { data: topSpeciesData } = await supabase
            .from("agent_memories")
            .select("species")
            .not("species", "is", null)
            .neq("species", "unknown");

        // Count species manually
        const speciesCount = new Map<string, number>();
        for (const row of topSpeciesData || []) {
            speciesCount.set(row.species, (speciesCount.get(row.species) || 0) + 1);
        }
        const topEntry = [...speciesCount.entries()].sort((a, b) => b[1] - a[1])[0];

        return NextResponse.json({
            total: total ?? 0,
            recent: recent ?? [],
            topSpecies: topEntry?.[0] ?? null,
            topSpeciesCount: topEntry?.[1] ?? 0,
        });
    } catch {
        return NextResponse.json({ total: 0, recent: [], topSpecies: null });
    }
}
