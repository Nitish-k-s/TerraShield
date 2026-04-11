import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";

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

        const supabase = getSupabaseAdmin();
        const { data: user } = await supabase.from("users_meta").select("user_id").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "No account found with that email" }, { status: 404 });

        await supabase.from("users_meta").update({ password_hash: hashPassword(newPassword) }).eq("email", email);
        return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Server error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
