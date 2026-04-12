/**
 * POST /api/enterprise/register
 * Generates a real TSK- API key, stores hash in Supabase, returns key once
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

function generateKey(): { raw: string; prefix: string; hash: string } {
    const raw = "TSK-" + crypto.randomBytes(20).toString("hex");
    const prefix = raw.slice(0, 12) + "...";
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    return { raw, prefix, hash };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();
        const { org_name, org_type, email, country, state, use_case, volume, sandbox } = body;

        if (!org_name || !org_type || !email || !country) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // Check if email already has a key
        const { data: existing } = await supabase
            .from("api_keys")
            .select("key_prefix")
            .eq("email", email)
            .single();

        if (existing) {
            return NextResponse.json({
                error: "An API key already exists for this email. Contact support to rotate it."
            }, { status: 409 });
        }

        const { raw, prefix, hash } = generateKey();

        const { error } = await supabase.from("api_keys").insert({
            key_hash: hash,
            key_prefix: prefix,
            org_name,
            org_type,
            email,
            country,
            use_case: use_case || null,
            volume: volume || "moderate",
            sandbox: sandbox ?? true,
        });

        if (error) throw new Error(error.message);

        return NextResponse.json({
            success: true,
            api_key: raw,        // shown once, never stored
            key_prefix: prefix,
            org_name,
            email,
        });

    } catch (err) {
        const msg = err instanceof Error ? err.message : "Server error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
