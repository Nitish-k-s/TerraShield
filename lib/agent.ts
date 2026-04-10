/**
 * lib/agent.ts
 * TerraShield Agent Memory — powered by Groq + SQLite vector-like storage
 *
 * Since Hindsight requires Python 3.11+ which isn't available,
 * we implement the same recall/retain pattern directly:
 *  - retain: stores sighting as a memory in SQLite
 *  - recall: uses Groq to semantically find relevant past sightings
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "lib", "db");
const MEMORY_DB_PATH = path.join(DB_DIR, "memory.db");

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

declare global { var __memoryDb: Database.Database | undefined; }

function getMemoryDb(): Database.Database {
    if (!global.__memoryDb) {
        global.__memoryDb = new Database(MEMORY_DB_PATH);
        global.__memoryDb.pragma("journal_mode = WAL");
        global.__memoryDb.exec(`
            CREATE TABLE IF NOT EXISTS agent_memories (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                content     TEXT NOT NULL,
                lat         REAL,
                lng         REAL,
                district    TEXT,
                state       TEXT,
                classification TEXT,
                risk_score  REAL,
                species     TEXT,
                confidence  REAL,
                created_at  TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
            );
            CREATE INDEX IF NOT EXISTS idx_memory_lat_lng ON agent_memories(lat, lng);
            CREATE INDEX IF NOT EXISTS idx_memory_district ON agent_memories(district);
        `);
    }
    return global.__memoryDb;
}

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
    const db = getMemoryDb();
    const content = `${classification} detected at ${lat.toFixed(5)}, ${lng.toFixed(5)} in ${district ?? "unknown"}, ${state ?? "unknown"}. Risk score: ${riskScore}/10. Species: ${speciesTags.join(", ")}. Confidence: ${Math.round(confidence * 100)}%. Date: ${new Date().toISOString()}`;

    db.prepare(`
        INSERT INTO agent_memories (content, lat, lng, district, state, classification, risk_score, species, confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(content, lat, lng, district, state, classification, riskScore, speciesTags[0] ?? "unknown", confidence);
}

// ─── Recall nearby sightings ──────────────────────────────────────────────────
export async function recallSightings(
    lat: number,
    lng: number,
    radiusKm = 50,
    topK = 5
): Promise<AgentMemory[]> {
    const db = getMemoryDb();

    // Get all memories and filter by distance (SQLite has no spatial index)
    const all = db.prepare<[], AgentMemory>("SELECT * FROM agent_memories ORDER BY created_at DESC LIMIT 500").all();

    const nearby = all
        .filter(m => m.lat != null && m.lng != null && haversineKm(lat, lng, m.lat, m.lng) <= radiusKm)
        .slice(0, topK);

    return nearby;
}

// ─── Use Groq to generate a memory-aware context summary ─────────────────────
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

    // Try Groq for a smart summary
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
            const groqSummary = data.choices?.[0]?.message?.content?.trim();
            if (groqSummary) {
                return { summary: groqSummary, pastSightings, groqEnhanced: true };
            }
        }
    } catch (e) {
        console.warn("[agent] Groq summary failed, using raw memories:", e);
    }

    return {
        summary: `Agent memory — ${pastSightings.length} past sightings near this location: ${rawMemories}`,
        pastSightings,
        groqEnhanced: false,
    };
}
