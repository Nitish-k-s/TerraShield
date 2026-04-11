import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createToken } from "@/lib/auth";

export const runtime = "nodejs";

function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { email, password, name, role } = await req.json();
        if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

        const supabase = getSupabaseAdmin();

        const { data: existing } = await supabase.from("users_meta").select("user_id").eq("email", email).single();
        if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

        const userId = crypto.randomUUID();
        const passwordHash = hashPassword(password);

        await supabase.from("users_meta").insert({
            user_id: userId, email, name: name ?? null,
            terra_points: 50, password_hash: passwordHash,
            role: role ?? 'user'
        });
        await supabase.from("points_history").insert({ user_id: userId, amount: 50, reason: "Welcome to TerraShield" });

        const token = await createToken({ id: userId, email, user_metadata: { full_name: name ?? "" } });
        return NextResponse.json({ token, user: { id: userId, email, name } }, { status: 201 });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Server error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
