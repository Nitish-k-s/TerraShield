/**
 * GET /api/user-stats
 *
 * Returns the authenticated user's personal contribution statistics:
 *   - total_reports      : all reports submitted by this user
 *   - outbreaks_flagged  : reports where ai_label is an invasive type
 *   - countries_active   : distinct countries estimated from GPS lat/lng in the user's reports
 *   - species_tracked    : distinct species from ai_tags across the user's reports
 */
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

// ─── Simple lat/lng → country lookup using major-country bounding boxes ────────
// Returns ISO 3166-1 alpha-2 code, or null if no match.
const COUNTRY_BOXES: Array<{ iso: string; minLat: number; maxLat: number; minLng: number; maxLng: number }> = [
    { iso: "IN", minLat: 6, maxLat: 37, minLng: 68, maxLng: 97 },
    { iso: "US", minLat: 24, maxLat: 50, minLng: -125, maxLng: -66 },
    { iso: "CA", minLat: 41, maxLat: 84, minLng: -141, maxLng: -52 },
    { iso: "GB", minLat: 49, maxLat: 61, minLng: -8, maxLng: 2 },
    { iso: "DE", minLat: 47, maxLat: 55, minLng: 6, maxLng: 15 },
    { iso: "FR", minLat: 41, maxLat: 51, minLng: -5, maxLng: 10 },
    { iso: "AU", minLat: -44, maxLat: -10, minLng: 113, maxLng: 154 },
    { iso: "BR", minLat: -34, maxLat: 5, minLng: -74, maxLng: -34 },
    { iso: "CN", minLat: 18, maxLat: 54, minLng: 73, maxLng: 135 },
    { iso: "JP", minLat: 24, maxLat: 46, minLng: 122, maxLng: 154 },
    { iso: "ZA", minLat: -35, maxLat: -22, minLng: 16, maxLng: 33 },
    { iso: "NG", minLat: 4, maxLat: 14, minLng: 3, maxLng: 15 },
    { iso: "MX", minLat: 14, maxLat: 33, minLng: -118, maxLng: -86 },
    { iso: "AR", minLat: -55, maxLat: -21, minLng: -74, maxLng: -53 },
    { iso: "RU", minLat: 41, maxLat: 82, minLng: 19, maxLng: 180 },
    { iso: "ID", minLat: -11, maxLat: 6, minLng: 95, maxLng: 141 },
    { iso: "PK", minLat: 23, maxLat: 37, minLng: 60, maxLng: 77 },
    { iso: "BD", minLat: 20, maxLat: 27, minLng: 88, maxLng: 93 },
    { iso: "NG", minLat: 4, maxLat: 14, minLng: 3, maxLng: 15 },
    { iso: "KE", minLat: -5, maxLat: 5, minLng: 33, maxLng: 42 },
    { iso: "NZ", minLat: -47, maxLat: -34, minLng: 166, maxLng: 178 },
    { iso: "ES", minLat: 35, maxLat: 44, minLng: -9, maxLng: 4 },
    { iso: "IT", minLat: 36, maxLat: 47, minLng: 6, maxLng: 19 },
    { iso: "PL", minLat: 49, maxLat: 55, minLng: 14, maxLng: 24 },
    { iso: "SE", minLat: 55, maxLat: 69, minLng: 11, maxLng: 24 },
];

function latLngToCountry(lat: number, lng: number): string | null {
    for (const b of COUNTRY_BOXES) {
        if (lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng) {
            return b.iso;
        }
    }
    // Fallback: use 1-degree cell as a unique region key
    return `${Math.round(lat)},${Math.round(lng)}`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
        const supabase = getSupabaseAdmin();
        const userId = user.id;

        const { count: totalReports } = await supabase.from("exif_data").select("*", { count: "exact", head: true }).eq("user_id", userId);
        const { count: outbreaksFlagged } = await supabase.from("exif_data").select("*", { count: "exact", head: true }).eq("user_id", userId).in("ai_label", ["invasive-plant", "invasive-animal"]).not("ai_analysed_at", "is", null);

        const { data: gpsRows } = await supabase.from("exif_data").select("latitude, longitude").eq("user_id", userId).not("latitude", "is", null).not("longitude", "is", null);
        const countrySet = new Set<string>();
        for (const row of gpsRows || []) {
            const c = latLngToCountry(row.latitude, row.longitude);
            if (c) countrySet.add(c);
        }

        const { data: tagRows } = await supabase.from("exif_data").select("ai_tags").eq("user_id", userId).not("ai_tags", "is", null).not("ai_analysed_at", "is", null);
        const speciesSet = new Set<string>();
        for (const row of tagRows || []) {
            try {
                const tags: string[] = Array.isArray(row.ai_tags) ? row.ai_tags : JSON.parse(row.ai_tags);
                const sp = tags.find(t => /^[A-Z]/.test(t) || t.includes(" ")) ?? tags[0];
                if (sp) speciesSet.add(sp.toLowerCase().trim());
            } catch { /* skip */ }
        }

        return NextResponse.json({ success: true, total_reports: totalReports || 0, outbreaks_flagged: outbreaksFlagged || 0, countries_active: countrySet.size, species_tracked: speciesSet.size });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unexpected error";
        console.error("[user-stats]", msg);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
