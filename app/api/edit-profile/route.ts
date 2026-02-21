import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateProfileContent } from "@/lib/db/users";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        // 1. Auth guard
        const authHeader = req.headers.get('authorization');
        let user = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const supabase = await createClient();
            const { data } = await supabase.auth.getUser(token);
            user = data?.user || null;
        } else {
            const supabase = await createClient();
            const { data } = await supabase.auth.getUser();
            user = data?.user || null;
        }

        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse payload
        const body = await req.json();

        // Allowed edit keys
        const updateData: any = {};
        if (typeof body.name === 'string') updateData.name = body.name;
        if (typeof body.gender === 'string') updateData.gender = body.gender;
        if (typeof body.phone === 'string') updateData.phone = body.phone;
        // if (typeof body.avatar_url === 'string') updateData.avatar_url = body.avatar_url; // Future implementation

        // 3. Update SQLite
        if (Object.keys(updateData).length > 0) {
            updateProfileContent(user.id, updateData);
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (err: unknown) {
        console.error("[edit-profile] Error:", err);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
