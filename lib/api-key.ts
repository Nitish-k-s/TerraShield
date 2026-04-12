/**
 * lib/api-key.ts
 * Verifies TSK- API keys against Supabase api_keys table
 */
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export interface ApiKeyResult {
    valid: boolean;
    org_name?: string;
    error?: string;
}

export async function verifyApiKey(req: { headers: { get(name: string): string | null } }): Promise<ApiKeyResult> {
    const authHeader = req.headers.get("authorization");
    const key = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!key) return { valid: false, error: "Missing Authorization header. Use: Authorization: Bearer TSK-..." };
    if (!key.startsWith("TSK-")) return { valid: false, error: "Invalid API key format. Keys must start with TSK-" };

    const hash = crypto.createHash("sha256").update(key).digest("hex");
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from("api_keys")
        .select("org_name, sandbox")
        .eq("key_hash", hash)
        .single();

    if (error || !data) return { valid: false, error: "Invalid or revoked API key." };

    return { valid: true, org_name: data.org_name };
}
