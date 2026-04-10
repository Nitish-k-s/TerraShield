/**
 * POST /api/auth/signup
 * Body: { email, password, name? }
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUsersDb } from "@/lib/db/sqlite-users";
import { createToken } from "@/lib/auth";

function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { email, password, name, role } = await req.json();
        if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

        const db = getUsersDb();

        // Ensure password_hash column exists
        try { db.exec("ALTER TABLE users_meta ADD COLUMN password_hash TEXT"); } catch {}
        try { db.exec("ALTER TABLE users_meta ADD COLUMN role TEXT DEFAULT 'user'"); } catch {}

        // Check if email already exists
        const existing = db.prepare("SELECT user_id FROM users_meta WHERE email = ?").get(email);
        if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

        // Create user
        const userId = crypto.randomUUID();
        const passwordHash = hashPassword(password);

        db.transaction(() => {
            db.prepare(`
                INSERT INTO users_meta (user_id, email, name, terra_points, password_hash, role)
                VALUES (?, ?, ?, 50, ?, ?)
            `).run(userId, email, name ?? null, passwordHash, role ?? 'user');
            db.prepare("INSERT INTO points_history (user_id, amount, reason) VALUES (?, 50, 'Welcome to TerraShield')").run(userId);
        })();

        const token = await createToken({ id: userId, email, user_metadata: { full_name: name ?? "" } });
        return NextResponse.json({ token, user: { id: userId, email, name } }, { status: 201 });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Server error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
