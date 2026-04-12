/**
 * GET /api/v1/satellite?lat=11.62&lng=76.59
 * Public API — requires TSK- API key
 * Returns satellite NDVI vegetation analysis for a coordinate
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-key";
import { validateVegetationAnomaly } from "@/lib/sentinel";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const auth = await verifyApiKey(req);
    if (!auth.valid) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") ?? "");
    const lng = parseFloat(searchParams.get("lng") ?? "");

    if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return NextResponse.json({ error: "Provide valid ?lat=&lng= query params" }, { status: 400 });
    }

    const result = await validateVegetationAnomaly(lat, lng);

    return NextResponse.json({
        success: true,
        org: auth.org_name,
        data: result,
        generated_at: new Date().toISOString(),
    });
}
