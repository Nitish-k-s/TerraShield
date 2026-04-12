import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserMeta, getPointHistory } from "@/lib/db/supabase-users";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const profile = await getUserMeta(user.id, user.email);
        const history = await getPointHistory(user.id);

        // Backfill name from token metadata if missing
        const metaName = (user.user_metadata?.full_name as string) || '';
        if (!profile.name && metaName) {
            const { updateProfileContent } = await import('@/lib/db/supabase-users');
            await updateProfileContent(user.id, { name: metaName });
            profile.name = metaName;
        }

        return NextResponse.json({ success: true, profile, history }, { status: 200 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        console.error("[user-profile] Error:", message);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
