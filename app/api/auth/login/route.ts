import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createToken } from "@/lib/auth";

export const runtime = "nodejs";

function verifyPassword(password: string, stored: string): boolean {
    try {
        const [salt, hash] = stored.split(":");
        const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
        return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(attempt, "hex"));
    } catch { return false; }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { email, password } = await req.json();
        if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

        const supabase = getSupabaseAdmin();
        const { data: user } = await supabase.from("users_meta").select("*").eq("email", email).single();
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
