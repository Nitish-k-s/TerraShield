/**
 * lib/agent.ts
 * TerraShield Agent Memory — powered by Hindsight Agent Memory Bank
 * Stores and recalls past sightings using Supabase PostgreSQL
 */

import { getSupabaseAdmin } from "@/lib/supabase/server";

export interface AgentMemory {
    id: number;
    content: string;
    lat: number;
    lng: number;
    district: string | null;
    state: string | null;
    classification: string;
    risk_score: number;
    species: string;
    confidence: number;
    created_at: string;
}

// ─── Haversine distance (km) ──────────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Retain a sighting in memory ──────────────────────────────────────────────
export async function retainSighting(
    lat: number,
    lng: number,
    district: string | null,
    state: string | null,
    classification: string,
    riskScore: number,
    speciesTags: string[],
    confidence: number
): Promise<void> {
    const supabase = getSupabaseAdmin();
    const content = `${classification} detected at ${lat.toFixed(5)}, ${lng.toFixed(5)} in ${district ?? "unknown"}, ${state ?? "unknown"}. Risk score: ${riskScore}/10. Species: ${speciesTags.join(", ")}. Confidence: ${Math.round(confidence * 100)}%. Date: ${new Date().toISOString()}`;

    await supabase.from("agent_memories").insert({
        content,
        lat,
        lng,
        district,
        state,
        classification,
        risk_score: riskScore,
        species: speciesTags[0] ?? "unknown",
        confidence,
    });
}

// ─── Recall nearby sightings ──────────────────────────────────────────────────
export async function recallSightings(
    lat: number,
    lng: number,
    radiusKm = 50,
    topK = 5
): Promise<AgentMemory[]> {
    const supabase = getSupabaseAdmin();

    // Fetch recent memories and filter by distance
    const { data } = await supabase
        .from("agent_memories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

    if (!data?.length) return [];

    return data
        .filter(m => m.lat != null && m.lng != null && haversineKm(lat, lng, m.lat, m.lng) <= radiusKm)
        .slice(0, topK) as AgentMemory[];
}

// ─── Build memory context with agent summary ───────────────────────────────────
export async function buildMemoryContext(
    lat: number,
    lng: number,
    currentSpecies: string
): Promise<{ summary: string; pastSightings: AgentMemory[]; groqEnhanced: boolean }> {
    const pastSightings = await recallSightings(lat, lng);

    if (pastSightings.length === 0) {
        return {
            summary: "No previous sightings in agent memory for this area.",
            pastSightings: [],
            groqEnhanced: false,
        };
    }

    const rawMemories = pastSightings.map(m => m.content).join(" | ");
    const groqKey = process.env.GROQ_API_KEY;

    if (!groqKey) {
        return {
            summary: `Agent memory — ${pastSightings.length} past sightings near this location: ${rawMemories}`,
            pastSightings,
            groqEnhanced: false,
        };
    }

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${groqKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [
                    {
                        role: "system",
                        content: "You are an ecological intelligence assistant. Summarize past invasive species sightings from agent memory in 2 sentences. Focus on patterns, risk escalation, and whether the current species matches past detections. Be concise and factual."
                    },
                    {
                        role: "user",
                        content: `Current detection: ${currentSpecies} at ${lat.toFixed(4)}, ${lng.toFixed(4)}.\n\nPast sightings from memory:\n${rawMemories}\n\nProvide a 2-sentence ecological context summary.`
                    }
                ],
                max_tokens: 150,
                temperature: 0.3,
            }),
            signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
            const data = await res.json() as any;
            const agentSummary = data.choices?.[0]?.message?.content?.trim();
            if (agentSummary) {
                return { summary: agentSummary, pastSightings, groqEnhanced: true };
            }
        }
    } catch (e) {
        console.warn("[agent] Agent memory summary failed:", e);
    }

    return {
        summary: `Agent memory — ${pastSightings.length} past sightings near this location: ${rawMemories}`,
        pastSightings,
        groqEnhanced: false,
    };
}
