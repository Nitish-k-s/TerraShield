import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserMeta, getPointHistory } from "@/lib/db/users";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        // 1. Auth guard
        const authHeader = req.headers.get('authorization');
        let user = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const supabase = await createClient();
            const { data, error } = await supabase.auth.getUser(token);
            if (error) console.error("[user-profile] Token error:", error);
            user = data?.user || null;
        } else {
            const supabase = await createClient();
            const { data } = await supabase.auth.getUser();
            user = data?.user || null;
        }

        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch / auto-create user meta in SQLite
        //    Pass the name from Supabase user_metadata so it's seeded on first creation
        const metaName: string = (user.user_metadata?.full_name as string) || '';
        const profile = getUserMeta(user.id, user.email || '');
        const history = getPointHistory(user.id);

        // Backfill name if it's missing in SQLite but present in Supabase user_metadata
        if (!profile.name && metaName) {
            const { updateProfileContent } = await import('@/lib/db/users');
            updateProfileContent(user.id, { name: metaName });
            profile.name = metaName;
        }

        return NextResponse.json({
            success: true,
            profile,
            history
        }, { status: 200 });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        console.error("[user-profile] Error:", message);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
