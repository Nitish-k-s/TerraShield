/**
 * GET /api/agent-memory
 * Returns agent memory stats for the home page panel
 */
import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
    try {
        const dbPath = path.join(process.cwd(), "lib", "db", "memory.db");
        if (!fs.existsSync(dbPath)) {
            return NextResponse.json({ total: 0, recent: [], topSpecies: null });
        }

        const db = new Database(dbPath, { readonly: true });

        const total = (db.prepare("SELECT COUNT(*) as n FROM agent_memories").get() as any)?.n ?? 0;

        const recent = db.prepare(`
            SELECT classification, district, state, risk_score, species, created_at
            FROM agent_memories
            ORDER BY created_at DESC
            LIMIT 5
        `).all() as any[];

        const topSpecies = db.prepare(`
            SELECT species, COUNT(*) as n FROM agent_memories
            WHERE species IS NOT NULL AND species != 'unknown'
            GROUP BY species ORDER BY n DESC LIMIT 1
        `).get() as any;

        db.close();

        return NextResponse.json({
            total,
            recent,
            topSpecies: topSpecies?.species ?? null,
            topSpeciesCount: topSpecies?.n ?? 0,
        });
    } catch {
        return NextResponse.json({ total: 0, recent: [], topSpecies: null });
    }
}
