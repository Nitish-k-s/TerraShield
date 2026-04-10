import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { updateProfileContent } from "@/lib/db/sqlite-users";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const updateData: any = {};
        if (typeof body.name === 'string') updateData.name = body.name;
        if (typeof body.gender === 'string') updateData.gender = body.gender;
        if (typeof body.phone === 'string') updateData.phone = body.phone;

        if (Object.keys(updateData).length > 0) updateProfileContent(user.id, updateData);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err: unknown) {
        console.error("[edit-profile] Error:", err);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
