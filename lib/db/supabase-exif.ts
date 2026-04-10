/**
 * lib/db/supabase-exif.ts
 *
 * Supabase PostgreSQL replacement for SQLite exif.ts
 * Vercel-compatible with no file system dependencies
 */

import { createClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InsertExifRecord {
    user_id: string;
    filename: string;
    mime_type: string;
    file_size_bytes?: number | null;

    // GPS
    latitude?: number | null;
    longitude?: number | null;
    altitude?: number | null;
    latitude_ref?: string | null;
    longitude_ref?: string | null;
    maps_url?: string | null;

    // Camera
    make?: string | null;
    model?: string | null;
    software?: string | null;
    date_time?: string | null;
    exposure_time?: string | null;
    f_number?: number | null;
    iso?: number | null;
    focal_length?: number | null;
    flash?: string | null;

    // Image
    image_width?: number | null;
    image_height?: number | null;
    orientation?: number | null;
    color_space?: string | null;

    // Storage path instead of BLOB
    image_storage_path?: string | null;

    // Raw
    all_tags_json: Record<string, unknown>;

    // Geocoding
    district?: string | null;
    state?: string | null;
    country?: string | null;
}

export interface AiAnalysisUpdate {
    ai_label?: string | null;
    ai_confidence?: number | null;
    ai_tags?: string[] | null;
    ai_summary?: string | null;
    ai_risk_score?: number | null;
    ai_analysed_at?: string | null;
    satellite_context_json?: Record<string, unknown> | null;
}

export interface ExifRecord extends Omit<InsertExifRecord, 'all_tags_json'>, AiAnalysisUpdate {
    id: number;
    all_tags_json: Record<string, unknown>;
    ai_tags: string[] | null;
    satellite_context_json: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

// ─── CRUD helpers ─────────────────────────────────────────────────────────────

export async function insertExifRecord(data: InsertExifRecord): Promise<number> {
    const supabase = getSupabaseAdmin();

    const { data: record, error } = await supabase
        .from("exif_data")
        .insert({
            ...data,
            date_time: data.date_time ? new Date(data.date_time).toISOString() : null,
        })
        .select("id")
        .single();

    if (error) throw new Error(`Failed to insert EXIF record: ${error.message}`);
    return record.id;
}

export async function updateExifDistrict(
    id: number,
    district: string | null,
    state: string | null,
    country: string | null
): Promise<void> {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
        .from("exif_data")
        .update({ district, state, country })
        .eq("id", id);

    if (error) throw new Error(`Failed to update district: ${error.message}`);
}

export async function getExifById(id: number): Promise<ExifRecord | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from("exif_data")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data as ExifRecord;
}

export async function getExifByUser(userId: string): Promise<ExifRecord[]> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from("exif_data")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch user records: ${error.message}`);
    return (data as ExifRecord[]) || [];
}

export async function getPendingAiAnalysis(): Promise<ExifRecord[]> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from("exif_data")
        .select("*")
        .is("ai_analysed_at", null)
        .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to fetch pending analysis: ${error.message}`);
    return (data as ExifRecord[]) || [];
}

export async function updateAiAnalysis(id: number, update: AiAnalysisUpdate): Promise<void> {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
        .from("exif_data")
        .update({
            ...update,
            ai_analysed_at: update.ai_analysed_at || new Date().toISOString(),
        })
        .eq("id", id);

    if (error) throw new Error(`Failed to update AI analysis: ${error.message}`);
}

export async function deleteExifRecord(id: number): Promise<void> {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
        .from("exif_data")
        .delete()
        .eq("id", id);

    if (error) throw new Error(`Failed to delete record: ${error.message}`);
}

export async function countExifRecords(): Promise<number> {
    const supabase = getSupabaseAdmin();

    const { count, error } = await supabase
        .from("exif_data")
        .select("*", { count: "exact", head: true });

    if (error) throw new Error(`Failed to count records: ${error.message}`);
    return count || 0;
}

// ─── Public Reports ───────────────────────────────────────────────────────────

export interface PublicReport {
    id: number;
    lat: number;
    lon: number;
    species: string;
    risk_score: number;
    confidence: number;
    created_at: string;
}

function parseSpecies(ai_tags: string[] | null, ai_summary: string | null): string {
    if (ai_tags && ai_tags.length > 0) {
        const species = ai_tags.find(t => /^[A-Z]/.test(t) || t.includes(' '));
        if (species) return species;
        return ai_tags[0];
    }
    if (ai_summary) {
        const match = ai_summary.match(/^([A-Z][a-z]+ [a-z]+)/);
        if (match) return match[1];
    }
    return 'Unknown species';
}

export async function getPublicReports(): Promise<PublicReport[]> {
    const supabase = getSupabaseAdmin();
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from("exif_data")
        .select("id, latitude, longitude, ai_tags, ai_summary, ai_risk_score, ai_confidence, created_at")
        .not("ai_analysed_at", "is", null)
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(200);

    if (error) throw new Error(`Failed to fetch public reports: ${error.message}`);

    return (data || []).map(r => ({
        id: r.id,
        lat: r.latitude!,
        lon: r.longitude!,
        species: parseSpecies(r.ai_tags, r.ai_summary),
        risk_score: Math.round((r.ai_risk_score ?? 0) * 10) / 10,
        confidence: Math.round((r.ai_confidence ?? 0) * 100) / 100,
        created_at: r.created_at.slice(0, 10),
    }));
}

// ─── Outbreak Clusters ────────────────────────────────────────────────────────

export interface OutbreakCluster {
    species: string;
    lat: number;
    lon: number;
    count: number;
    avg_risk: number;
    level: 'monitoring' | 'elevated' | 'critical';
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function riskLevel(score: number): 'monitoring' | 'elevated' | 'critical' {
    if (score >= 7) return 'critical';
    if (score >= 4) return 'elevated';
    return 'monitoring';
}

const CLUSTER_THRESHOLD = 3;
const CLUSTER_RADIUS_KM = 5;
const CLUSTER_WINDOW_DAYS = 7;

export async function detectOutbreakClusters(): Promise<OutbreakCluster[]> {
    const supabase = getSupabaseAdmin();
    const cutoff = new Date(Date.now() - CLUSTER_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await supabase
        .from("exif_data")
        .select("id, latitude, longitude, ai_tags, ai_summary, ai_risk_score")
        .not("ai_analysed_at", "is", null)
        .in("ai_label", ["invasive-plant", "invasive-animal"])
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to detect clusters: ${error.message}`);
    if (!rows || rows.length === 0) return [];

    const assigned = new Set<number>();
    const clusters: OutbreakCluster[] = [];

    for (let i = 0; i < rows.length; i++) {
        if (assigned.has(rows[i].id)) continue;
        const seed = rows[i];
        const seedSpecies = parseSpecies(seed.ai_tags, seed.ai_summary);
        const members = [seed];
        assigned.add(seed.id);

        for (let j = i + 1; j < rows.length; j++) {
            if (assigned.has(rows[j].id)) continue;
            const candidate = rows[j];
            const candSpecies = parseSpecies(candidate.ai_tags, candidate.ai_summary);
            if (candSpecies !== seedSpecies) continue;
            const dist = haversineKm(seed.latitude!, seed.longitude!, candidate.latitude!, candidate.longitude!);
            if (dist <= CLUSTER_RADIUS_KM) {
                members.push(candidate);
                assigned.add(candidate.id);
            }
        }

        if (members.length >= CLUSTER_THRESHOLD) {
            const avgLat = members.reduce((s, r) => s + r.latitude!, 0) / members.length;
            const avgLon = members.reduce((s, r) => s + r.longitude!, 0) / members.length;
            const avgRisk = members.reduce((s, r) => s + (r.ai_risk_score ?? 0), 0) / members.length;
            clusters.push({
                species: seedSpecies,
                lat: Math.round(avgLat * 1e5) / 1e5,
                lon: Math.round(avgLon * 1e5) / 1e5,
                count: members.length,
                avg_risk: Math.round(avgRisk * 10) / 10,
                level: riskLevel(avgRisk),
            });
        }
    }

    return clusters.sort((a, b) => b.avg_risk - a.avg_risk);
}

// ─── Statistics Functions ─────────────────────────────────────────────────────

export interface DistrictRow {
    district: string;
    state: string | null;
    country: string | null;
    report_count: number;
    invasive_count: number;
    avg_risk_score: number;
    risk_level: 'Monitoring' | 'Elevated' | 'Critical';
}

export async function getDistrictDistribution(): Promise<DistrictRow[]> {
    const supabase = getSupabaseAdmin();
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase.rpc('get_district_distribution', { cutoff_date: cutoff });

    if (error) {
        // Fallback to manual aggregation if RPC doesn't exist
        const { data: rows } = await supabase
            .from("exif_data")
            .select("district, state, country, ai_label, ai_risk_score")
            .not("district", "is", null)
            .not("ai_analysed_at", "is", null)
            .gte("created_at", cutoff);

        if (!rows) return [];

        const grouped = new Map<string, DistrictRow>();
        rows.forEach(r => {
            const key = r.district!;
            if (!grouped.has(key)) {
                grouped.set(key, {
                    district: r.district!,
                    state: r.state,
                    country: r.country,
                    report_count: 0,
                    invasive_count: 0,
                    avg_risk_score: 0,
                    risk_level: 'Monitoring',
                });
            }
            const row = grouped.get(key)!;
            row.report_count++;
            if (r.ai_label === 'invasive-plant' || r.ai_label === 'invasive-animal') {
                row.invasive_count++;
            }
            row.avg_risk_score += r.ai_risk_score ?? 0;
        });

        return Array.from(grouped.values()).map(r => {
            r.avg_risk_score = Math.round((r.avg_risk_score / r.report_count) * 10) / 10;
            r.risk_level = r.avg_risk_score >= 7 ? 'Critical' : r.avg_risk_score >= 4 ? 'Elevated' : 'Monitoring';
            return r;
        }).sort((a, b) => b.report_count - a.report_count);
    }

    return data || [];
}

export interface OverviewStats {
    total_reports: number;
    invasive_count: number;
    high_risk_zones: number;
    avg_confidence: number;
    most_reported_species: string | null;
    active_clusters: number;
}

export async function getOverviewStats(): Promise<OverviewStats> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from("exif_data")
        .select("ai_label, ai_risk_score, ai_confidence, ai_tags")
        .not("ai_analysed_at", "is", null);

    if (error) throw new Error(`Failed to fetch overview stats: ${error.message}`);

    const rows = data || [];
    const invasive_count = rows.filter(r => r.ai_label === 'invasive-plant' || r.ai_label === 'invasive-animal').length;
    const high_risk_zones = rows.filter(r => (r.ai_risk_score ?? 0) >= 7).length;
    const avg_confidence = rows.length > 0
        ? Math.round((rows.reduce((s, r) => s + (r.ai_confidence ?? 0), 0) / rows.length) * 100)
        : 0;

    const speciesCount = new Map<string, number>();
    rows.forEach(r => {
        if (r.ai_tags && r.ai_tags.length > 0) {
            const species = r.ai_tags[0];
            speciesCount.set(species, (speciesCount.get(species) || 0) + 1);
        }
    });

    const most_reported_species = speciesCount.size > 0
        ? Array.from(speciesCount.entries()).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    const clusters = await detectOutbreakClusters();

    return {
        total_reports: rows.length,
        invasive_count,
        high_risk_zones,
        avg_confidence,
        most_reported_species,
        active_clusters: clusters.length,
    };
}

export interface RiskDistribution { low: number; moderate: number; high: number; }

export async function getRiskDistribution(): Promise<RiskDistribution> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from("exif_data")
        .select("ai_risk_score")
        .not("ai_analysed_at", "is", null);

    if (error) throw new Error(`Failed to fetch risk distribution: ${error.message}`);

    const rows = data || [];
    return {
        low: rows.filter(r => (r.ai_risk_score ?? 0) < 3.5).length,
        moderate: rows.filter(r => {
            const score = r.ai_risk_score ?? 0;
            return score >= 3.5 && score <= 6.5;
        }).length,
        high: rows.filter(r => (r.ai_risk_score ?? 0) > 6.5).length,
    };
}
