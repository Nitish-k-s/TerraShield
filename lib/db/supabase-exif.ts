/**
 * lib/db/supabase-exif.ts — Supabase PostgreSQL data layer for EXIF/reports
 */
import { getSupabaseAdmin } from "@/lib/supabase/server";

export interface InsertExifRecord {
    user_id: string; filename: string; mime_type: string;
    file_size_bytes?: number | null;
    latitude?: number | null; longitude?: number | null; altitude?: number | null;
    latitude_ref?: string | null; longitude_ref?: string | null; maps_url?: string | null;
    make?: string | null; model?: string | null; software?: string | null;
    date_time?: string | null; exposure_time?: string | null;
    f_number?: number | null; iso?: number | null; focal_length?: number | null; flash?: string | null;
    image_width?: number | null; image_height?: number | null;
    orientation?: number | null; color_space?: string | null;
    image_storage_path?: string | null;
    all_tags_json: Record<string, unknown>;
    district?: string | null; state?: string | null; country?: string | null;
}

export interface AiAnalysisUpdate {
    ai_label?: string | null; ai_confidence?: number | null;
    ai_tags?: string[] | null; ai_summary?: string | null;
    ai_risk_score?: number | null; ai_analysed_at?: string | null;
    satellite_context_json?: Record<string, unknown> | null;
}

export interface ExifRecord extends Omit<InsertExifRecord, 'all_tags_json'>, AiAnalysisUpdate {
    id: number;
    all_tags_json: Record<string, unknown>;
    created_at: string; updated_at: string;
}

export async function insertExifRecord(data: InsertExifRecord): Promise<number> {
    const supabase = getSupabaseAdmin();
    const { data: record, error } = await supabase
        .from("exif_data")
        .insert({ ...data, date_time: data.date_time ? new Date(data.date_time).toISOString() : null })
        .select("id").single();
    if (error) throw new Error(`Failed to insert EXIF record: ${error.message}`);
    return record.id;
}

export async function updateExifDistrict(id: number, district: string | null, state: string | null, country: string | null): Promise<void> {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("exif_data").update({ district, state, country }).eq("id", id);
    if (error) throw new Error(`Failed to update district: ${error.message}`);
}

export async function getExifById(id: number): Promise<ExifRecord | null> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("exif_data").select("*").eq("id", id).single();
    if (error) return null;
    return data as ExifRecord;
}

export async function getPendingAiAnalysis(): Promise<ExifRecord[]> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("exif_data").select("*").is("ai_analysed_at", null).order("created_at", { ascending: true });
    if (error) throw new Error(`Failed to fetch pending: ${error.message}`);
    return (data as ExifRecord[]) || [];
}

export async function updateAiAnalysis(id: number, update: AiAnalysisUpdate): Promise<void> {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("exif_data").update({
        ...update,
        ai_tags: Array.isArray(update.ai_tags) ? update.ai_tags : (typeof update.ai_tags === 'string' ? JSON.parse(update.ai_tags) : update.ai_tags),
        ai_analysed_at: update.ai_analysed_at || new Date().toISOString(),
    }).eq("id", id);
    if (error) throw new Error(`Failed to update AI analysis: ${error.message}`);
}

// ─── Public Reports ───────────────────────────────────────────────────────────

export interface PublicReport { id: number; lat: number; lon: number; species: string; risk_score: number; confidence: number; created_at: string; }
export interface OutbreakCluster { species: string; lat: number; lon: number; count: number; avg_risk: number; level: 'monitoring' | 'elevated' | 'critical'; }

function parseSpecies(ai_tags: string[] | null, ai_summary: string | null): string {
    if (ai_tags?.length) {
        const s = ai_tags.find(t => /^[A-Z]/.test(t) || t.includes(' '));
        return s || ai_tags[0];
    }
    if (ai_summary) { const m = ai_summary.match(/^([A-Z][a-z]+ [a-z]+)/); if (m) return m[1]; }
    return 'Unknown species';
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getPublicReports(): Promise<PublicReport[]> {
    const supabase = getSupabaseAdmin();
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase.from("exif_data")
        .select("id, latitude, longitude, ai_tags, ai_summary, ai_risk_score, ai_confidence, created_at")
        .not("ai_analysed_at", "is", null).not("latitude", "is", null).not("longitude", "is", null)
        .gte("created_at", cutoff).order("created_at", { ascending: false }).limit(200);
    if (error) throw new Error(`Failed to fetch public reports: ${error.message}`);
    return (data || []).map(r => ({
        id: r.id, lat: r.latitude!, lon: r.longitude!,
        species: parseSpecies(r.ai_tags, r.ai_summary),
        risk_score: Math.round((r.ai_risk_score ?? 0) * 10) / 10,
        confidence: Math.round((r.ai_confidence ?? 0) * 100) / 100,
        created_at: r.created_at.slice(0, 10),
    }));
}

export async function detectOutbreakClusters(): Promise<OutbreakCluster[]> {
    const supabase = getSupabaseAdmin();
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: rows, error } = await supabase.from("exif_data")
        .select("id, latitude, longitude, ai_tags, ai_summary, ai_risk_score")
        .not("ai_analysed_at", "is", null).in("ai_label", ["invasive-plant", "invasive-animal"])
        .not("latitude", "is", null).not("longitude", "is", null).gte("created_at", cutoff);
    if (error) throw new Error(`Failed to detect clusters: ${error.message}`);
    if (!rows?.length) return [];

    const assigned = new Set<number>(), clusters: OutbreakCluster[] = [];
    for (let i = 0; i < rows.length; i++) {
        if (assigned.has(rows[i].id)) continue;
        const seed = rows[i], seedSpecies = parseSpecies(seed.ai_tags, seed.ai_summary), members = [seed];
        assigned.add(seed.id);
        for (let j = i + 1; j < rows.length; j++) {
            if (assigned.has(rows[j].id)) continue;
            if (parseSpecies(rows[j].ai_tags, rows[j].ai_summary) !== seedSpecies) continue;
            if (haversineKm(seed.latitude!, seed.longitude!, rows[j].latitude!, rows[j].longitude!) <= 5) {
                members.push(rows[j]); assigned.add(rows[j].id);
            }
        }
        if (members.length >= 3) {
            const avgLat = members.reduce((s, r) => s + r.latitude!, 0) / members.length;
            const avgLon = members.reduce((s, r) => s + r.longitude!, 0) / members.length;
            const avgRisk = members.reduce((s, r) => s + (r.ai_risk_score ?? 0), 0) / members.length;
            clusters.push({ species: seedSpecies, lat: Math.round(avgLat * 1e5) / 1e5, lon: Math.round(avgLon * 1e5) / 1e5, count: members.length, avg_risk: Math.round(avgRisk * 10) / 10, level: avgRisk >= 7 ? 'critical' : avgRisk >= 4 ? 'elevated' : 'monitoring' });
        }
    }
    return clusters.sort((a, b) => b.avg_risk - a.avg_risk);
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export interface DistrictFilter { district?: string | null; state?: string | null; country?: string | null; }
export interface DistrictRow { district: string; state: string | null; country: string | null; report_count: number; invasive_count: number; avg_risk_score: number; risk_level: 'Monitoring' | 'Elevated' | 'Critical'; }
export interface OverviewStats { total_reports: number; invasive_count: number; high_risk_zones: number; avg_confidence: number; most_reported_species: string | null; active_clusters: number; }
export interface RiskDistribution { low: number; moderate: number; high: number; }
export interface DistrictListRow { country: string; state: string | null; district: string; }
export interface SpeciesDistrictRow { district: string; state: string | null; country: string | null; species: string; count: number; }
export interface TopDistrictRow { district: string; state: string | null; country: string | null; report_count: number; invasive_count: number; avg_risk: number; risk_level: 'Monitoring' | 'Elevated' | 'Critical'; }
export interface DailyTrendRow { day: string; date: string; count: number; }
export interface AlertRow { id: number; species: string | null; district: string | null; state: string | null; country: string | null; latitude: number | null; longitude: number | null; ai_risk_score: number | null; ai_confidence: number | null; ai_label: string | null; ai_analysed_at: string | null; }

export async function getDistrictDistribution(): Promise<DistrictRow[]> {
    const supabase = getSupabaseAdmin();
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase.from("exif_data").select("district, state, country, ai_label, ai_risk_score")
        .not("district", "is", null).not("ai_analysed_at", "is", null).gte("created_at", cutoff);
    if (!data) return [];
    const grouped = new Map<string, DistrictRow>();
    data.forEach(r => {
        const key = r.district!;
        if (!grouped.has(key)) grouped.set(key, { district: r.district!, state: r.state, country: r.country, report_count: 0, invasive_count: 0, avg_risk_score: 0, risk_level: 'Monitoring' });
        const row = grouped.get(key)!;
        row.report_count++;
        if (r.ai_label === 'invasive-plant' || r.ai_label === 'invasive-animal') row.invasive_count++;
        row.avg_risk_score += r.ai_risk_score ?? 0;
    });
    return Array.from(grouped.values()).map(r => {
        r.avg_risk_score = Math.round((r.avg_risk_score / r.report_count) * 10) / 10;
        r.risk_level = r.avg_risk_score >= 7 ? 'Critical' : r.avg_risk_score >= 4 ? 'Elevated' : 'Monitoring';
        return r;
    }).sort((a, b) => b.report_count - a.report_count);
}

export async function getOverviewStats(f?: DistrictFilter): Promise<OverviewStats> {
    const supabase = getSupabaseAdmin();
    let q = supabase.from("exif_data").select("ai_label, ai_risk_score, ai_confidence, ai_tags").not("ai_analysed_at", "is", null);
    if (f?.country) q = q.eq("country", f.country);
    if (f?.state) q = q.eq("state", f.state);
    if (f?.district) q = q.eq("district", f.district);
    const { data } = await q;
    const rows = data || [];
    const invasive_count = rows.filter(r => r.ai_label === 'invasive-plant' || r.ai_label === 'invasive-animal').length;
    const high_risk_zones = rows.filter(r => (r.ai_risk_score ?? 0) >= 7).length;
    const avg_confidence = rows.length > 0 ? Math.round((rows.reduce((s, r) => s + (r.ai_confidence ?? 0), 0) / rows.length) * 100) : 0;
    const speciesCount = new Map<string, number>();
    rows.forEach(r => { if (r.ai_tags?.length) { const sp = r.ai_tags[0]; speciesCount.set(sp, (speciesCount.get(sp) || 0) + 1); } });
    const most_reported_species = speciesCount.size > 0 ? Array.from(speciesCount.entries()).sort((a, b) => b[1] - a[1])[0][0] : null;
    const clusters = await detectOutbreakClusters();
    return { total_reports: rows.length, invasive_count, high_risk_zones, avg_confidence, most_reported_species, active_clusters: clusters.length };
}

export async function getRiskDistribution(f?: DistrictFilter): Promise<RiskDistribution> {
    const supabase = getSupabaseAdmin();
    let q = supabase.from("exif_data").select("ai_risk_score").not("ai_analysed_at", "is", null);
    if (f?.country) q = q.eq("country", f.country);
    if (f?.state) q = q.eq("state", f.state);
    if (f?.district) q = q.eq("district", f.district);
    const { data } = await q;
    const rows = data || [];
    return {
        low: rows.filter(r => (r.ai_risk_score ?? 0) < 3.5).length,
        moderate: rows.filter(r => { const s = r.ai_risk_score ?? 0; return s >= 3.5 && s <= 6.5; }).length,
        high: rows.filter(r => (r.ai_risk_score ?? 0) > 6.5).length,
    };
}

export async function getDistrictList(): Promise<DistrictListRow[]> {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("exif_data").select("country, state, district").not("district", "is", null).not("ai_analysed_at", "is", null).not("country", "is", null);
    if (!data) return [];
    const seen = new Set<string>();
    return data.filter(r => { const k = `${r.country}|${r.state}|${r.district}`; if (seen.has(k)) return false; seen.add(k); return true; }).map(r => ({ country: r.country!, state: r.state, district: r.district! }));
}

export async function getSpeciesByDistrict(): Promise<SpeciesDistrictRow[]> {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("exif_data").select("district, state, country, ai_tags").not("district", "is", null).not("ai_analysed_at", "is", null).not("ai_tags", "is", null);
    if (!data) return [];
    const map = new Map<string, SpeciesDistrictRow>();
    data.forEach(r => {
        const species = Array.isArray(r.ai_tags) ? r.ai_tags[0] : null;
        if (!species) return;
        const key = `${r.district}|${species}`;
        if (!map.has(key)) map.set(key, { district: r.district!, state: r.state, country: r.country, species, count: 0 });
        map.get(key)!.count++;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export async function getTopDistricts(f?: Pick<DistrictFilter, 'country'>): Promise<TopDistrictRow[]> {
    const supabase = getSupabaseAdmin();
    let q = supabase.from("exif_data").select("district, state, country, ai_label, ai_risk_score").not("ai_analysed_at", "is", null).not("district", "is", null);
    if (f?.country) q = q.eq("country", f.country);
    const { data } = await q;
    if (!data) return [];
    const map = new Map<string, TopDistrictRow>();
    data.forEach(r => {
        if (!map.has(r.district!)) map.set(r.district!, { district: r.district!, state: r.state, country: r.country, report_count: 0, invasive_count: 0, avg_risk: 0, risk_level: 'Monitoring' });
        const row = map.get(r.district!)!;
        row.report_count++;
        if (r.ai_label === 'invasive-plant' || r.ai_label === 'invasive-animal') row.invasive_count++;
        row.avg_risk += r.ai_risk_score ?? 0;
    });
    return Array.from(map.values()).map(r => {
        r.avg_risk = Math.round((r.avg_risk / r.report_count) * 10) / 10;
        r.risk_level = r.avg_risk >= 7 ? 'Critical' : r.avg_risk >= 4 ? 'Elevated' : 'Monitoring';
        return r;
    }).sort((a, b) => b.avg_risk - a.avg_risk).slice(0, 10);
}

export async function getTimeTrends(f?: DistrictFilter, days = 30): Promise<DailyTrendRow[]> {
    const supabase = getSupabaseAdmin();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    let q = supabase.from("exif_data").select("created_at").not("ai_analysed_at", "is", null).gte("created_at", cutoff);
    if (f?.country) q = q.eq("country", f.country);
    if (f?.state) q = q.eq("state", f.state);
    if (f?.district) q = q.eq("district", f.district);
    const { data } = await q;
    const rows = data || [];
    const result: DailyTrendRow[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const dateStr = d.toISOString().slice(0, 10);
        const count = rows.filter(r => r.created_at.slice(0, 10) === dateStr).length;
        result.push({ day: dayNames[d.getDay()], date: dateStr, count });
    }
    return result;
}

export async function getRecentAlerts(f?: DistrictFilter, limit = 20): Promise<AlertRow[]> {
    const supabase = getSupabaseAdmin();
    let q = supabase.from("exif_data")
        .select("id, ai_tags, district, state, country, latitude, longitude, ai_risk_score, ai_confidence, ai_label, ai_analysed_at")
        .not("ai_analysed_at", "is", null).gt("ai_risk_score", 4).order("ai_analysed_at", { ascending: false }).limit(limit);
    if (f?.country) q = q.eq("country", f.country);
    if (f?.state) q = q.eq("state", f.state);
    if (f?.district) q = q.eq("district", f.district);
    const { data } = await q;
    return (data || []).map(r => ({ ...r, species: Array.isArray(r.ai_tags) ? r.ai_tags[0] : null }));
}
