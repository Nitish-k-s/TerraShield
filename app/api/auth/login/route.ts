/**
 * POST /api/auth/login
 * Body: { email, password }
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUsersDb } from "@/lib/db/sqlite-users";
import { createToken } from "@/lib/auth";

function verifyPassword(password: string, stored: string): boolean {
    try {
        const [salt, hash] = stored.split(":");
        const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
        return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(attempt, "hex"));
    } catch {
        return false;
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { email, password } = await req.json();
        if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

        const db = getUsersDb();

        // Ensure password_hash column exists
        try { db.exec("ALTER TABLE users_meta ADD COLUMN password_hash TEXT"); } catch { /* exists */ }

        const user = db.prepare("SELECT * FROM users_meta WHERE email = ?").get(email) as any;
        if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        if (!user.password_hash) return NextResponse.json({ error: "Account has no password set. Use forgot password." }, { status: 401 });
        if (!verifyPassword(password, user.password_hash)) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

        const token = await createToken({ id: user.user_id, email: user.email, user_metadata: { full_name: user.name ?? "" } });
        return NextResponse.json({ token, user: { id: user.user_id, email: user.email, name: user.name } });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Server error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
