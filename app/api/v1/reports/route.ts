/**
 * GET /api/v1/reports
 * Public API — requires TSK- API key
 * Returns invasive species sightings from last 30 days
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-key";
import { getPublicReports, detectOutbreakClusters } from "@/lib/db/supabase-exif";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const auth = await verifyApiKey(req);
    if (!auth.valid) return NextResponse.json({ error: auth.error }, { status: 401 });

    const reports = await getPublicReports();
    const clusters = await detectOutbreakClusters();

    return NextResponse.json({
        success: true,
        org: auth.org_name,
        data: {
            reports,
            clusters,
            total: reports.length,
            generated_at: new Date().toISOString(),
        },
        docs: "https://github.com/Nitish-k-s/TerraShield#api-reference",
    });
}
