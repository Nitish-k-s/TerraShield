/**
 * GET /api/enterprise/my-keys
 * Returns API keys for the authenticated user's email
 */
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("api_keys")
        .select("id, key_prefix, org_name, org_type, email, country, use_case, volume, sandbox, created_at")
        .eq("email", user.email)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, keys: data || [] });
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing key id" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    // Only allow deleting own keys
    const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", id)
        .eq("email", user.email);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
