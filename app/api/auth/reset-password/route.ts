/**
 * POST /api/auth/reset-password
 * Body: { email, newPassword }
 * Since there's no email server, this directly resets the password if the email exists.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUsersDb } from "@/lib/db/sqlite-users";

export const runtime = "nodejs";

function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { email, newPassword } = await req.json();
        if (!email || !newPassword) return NextResponse.json({ error: "Email and new password required" }, { status: 400 });
        if (newPassword.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

        const db = getUsersDb();
        try { db.exec("ALTER TABLE users_meta ADD COLUMN password_hash TEXT"); } catch {}

        const user = db.prepare("SELECT user_id FROM users_meta WHERE email = ?").get(email) as any;
        if (!user) return NextResponse.json({ error: "No account found with that email" }, { status: 404 });

        db.prepare("UPDATE users_meta SET password_hash = ? WHERE email = ?").run(hashPassword(newPassword), email);
        return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Server error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
