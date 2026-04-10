/**
 * lib/db/sqlite-exif.ts
 * SQLite-backed EXIF data store (better-sqlite3, synchronous)
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "lib", "db");
const DB_PATH = path.join(DB_DIR, "exif.db");

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

declare global { var __exifDb: Database.Database | undefined; }

export function getDb(): Database.Database {
    if (!global.__exifDb) {
        global.__exifDb = new Database(DB_PATH);
        global.__exifDb.pragma("journal_mode = WAL");
        global.__exifDb.pragma("foreign_keys = ON");
        initSchema(global.__exifDb);
    }
    return global.__exifDb;
}

/** Re-export getUsersDb so statistics route can import from one place */
export { getUsersDb } from "@/lib/db/sqlite-users";

function initSchema(db: Database.Database): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS exif_data (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         TEXT    NOT NULL,
            filename        TEXT    NOT NULL,
            mime_type       TEXT    NOT NULL,
            file_size_bytes INTEGER,
            latitude        REAL,
            longitude       REAL,
            altitude        REAL,
            latitude_ref    TEXT,
            longitude_ref   TEXT,
            maps_url        TEXT,
            make            TEXT,
            model           TEXT,
            software        TEXT,
            date_time       TEXT,
            exposure_time   TEXT,
            f_number        REAL,
            iso             INTEGER,
            focal_length    REAL,
            flash           TEXT,
            image_width     INTEGER,
            image_height    INTEGER,
            orientation     INTEGER,
            color_space     TEXT,
            image_storage_path TEXT,
            ai_label        TEXT,
            ai_confidence   REAL,
            ai_tags         TEXT,
            ai_summary      TEXT,
            ai_risk_score   REAL,
            ai_analysed_at  TEXT,
            all_tags_json   TEXT NOT NULL DEFAULT '{}',
            satellite_context_json TEXT,
            district        TEXT,
            state           TEXT,
            country         TEXT,
            created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
            updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        );
        CREATE TRIGGER IF NOT EXISTS trg_exif_updated_at
        AFTER UPDATE ON exif_data BEGIN
            UPDATE exif_data SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id;
        END;
        CREATE INDEX IF NOT EXISTS idx_exif_user_id    ON exif_data(user_id);
        CREATE INDEX IF NOT EXISTS idx_exif_lat_lng    ON exif_data(latitude, longitude);
        CREATE INDEX IF NOT EXISTS idx_exif_ai_label   ON exif_data(ai_label);
        CREATE INDEX IF NOT EXISTS idx_exif_analysed   ON exif_data(ai_analysed_at);
        CREATE INDEX IF NOT EXISTS idx_exif_created_at ON exif_data(created_at);
        CREATE INDEX IF NOT EXISTS idx_exif_district   ON exif_data(district);
    `);
    // safe migrations
    for (const col of ["image_storage_path TEXT", "satellite_context_json TEXT",
        "district TEXT", "state TEXT", "country TEXT"]) {
        try { db.exec(`ALTER TABLE exif_data ADD COLUMN ${col}`); } catch { /* exists */ }
    }
}

// ─── Types ────────────────────────────────────────────────────────────────────

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
    all_tags_json: string;
    district?: string | null; state?: string | null; country?: string | null;
}

export interface AiAnalysisUpdate {
    ai_label?: string | null; ai_confidence?: number | null;
    ai_tags?: string | null; ai_summary?: string | null;
    ai_risk_score?: number | null; ai_analysed_at?: string | null;
    satellite_context_json?: string | null;
}

export interface ExifRecord extends InsertExifRecord, AiAnalysisUpdate {
    id: number; created_at: string; updated_at: string;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function insertExifRecord(data: InsertExifRecord): number {
    const db = getDb();
    const result = db.prepare(`
        INSERT INTO exif_data (
            user_id, filename, mime_type, file_size_bytes,
            latitude, longitude, altitude, latitude_ref, longitude_ref, maps_url,
            make, model, software, date_time, exposure_time,
            f_number, iso, focal_length, flash,
            image_width, image_height, orientation, color_space,
            image_storage_path, all_tags_json
        ) VALUES (
            @user_id, @filename, @mime_type, @file_size_bytes,
            @latitude, @longitude, @altitude, @latitude_ref, @longitude_ref, @maps_url,
            @make, @model, @software, @date_time, @exposure_time,
            @f_number, @iso, @focal_length, @flash,
            @image_width, @image_height, @orientation, @color_space,
            @image_storage_path, @all_tags_json
        )
    `).run(data);
    return result.lastInsertRowid as number;
}

export function updateExifDistrict(id: number, district: string | null, state: string | null, country: string | null): void {
    getDb().prepare("UPDATE exif_data SET district=?, state=?, country=? WHERE id=?").run(district, state, country, id);
}

export function getExifById(id: number): ExifRecord | undefined {
    return getDb().prepare<[number], ExifRecord>("SELECT * FROM exif_data WHERE id=?").get(id);
}

export function getExifByUser(userId: string): ExifRecord[] {
    return getDb().prepare<[string], ExifRecord>("SELECT * FROM exif_data WHERE user_id=? ORDER BY created_at DESC").all(userId);
}

export function getPendingAiAnalysis(): ExifRecord[] {
    return getDb().prepare<[], ExifRecord>("SELECT * FROM exif_data WHERE ai_analysed_at IS NULL ORDER BY created_at ASC").all();
}

export function updateAiAnalysis(id: number, update: AiAnalysisUpdate): void {
    getDb().prepare(`
        UPDATE exif_data SET
            ai_label=@ai_label, ai_confidence=@ai_confidence, ai_tags=@ai_tags,
            ai_summary=@ai_summary, ai_risk_score=@ai_risk_score,
            ai_analysed_at=@ai_analysed_at, satellite_context_json=@satellite_context_json
        WHERE id=@id
    `).run({ ...update, id });
}

export function deleteExifRecord(id: number): void {
    getDb().prepare<[number]>("DELETE FROM exif_data WHERE id=?").run(id);
}

export function countExifRecords(): number {
    return (getDb().prepare<[], { total: number }>("SELECT COUNT(*) AS total FROM exif_data").get()?.total) ?? 0;
}

// ─── Public Reports ───────────────────────────────────────────────────────────

export interface PublicReport { id: number; lat: number; lon: number; species: string; risk_score: number; confidence: number; created_at: string; }

function parseSpecies(ai_tags: string | null, ai_summary: string | null): string {
    if (ai_tags) {
        try {
            const tags: string[] = JSON.parse(ai_tags);
            const s = tags.find(t => /^[A-Z]/.test(t) || t.includes(' '));
            if (s) return s;
            if (tags.length > 0) return tags[0];
        } catch { /* fall through */ }
    }
    if (ai_summary) { const m = ai_summary.match(/^([A-Z][a-z]+ [a-z]+)/); if (m) return m[1]; }
    return 'Unknown species';
}

export function getPublicReports(): PublicReport[] {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    return getDb().prepare<[string], any>(`
        SELECT id, latitude, longitude, ai_tags, ai_summary, ai_risk_score, ai_confidence, created_at
        FROM exif_data
        WHERE ai_analysed_at IS NOT NULL AND latitude IS NOT NULL AND longitude IS NOT NULL AND created_at >= ?
        ORDER BY created_at DESC LIMIT 200
    `).all(cutoff).map(r => ({
        id: r.id, lat: r.latitude, lon: r.longitude,
        species: parseSpecies(r.ai_tags, r.ai_summary),
        risk_score: Math.round((r.ai_risk_score ?? 0) * 10) / 10,
        confidence: Math.round((r.ai_confidence ?? 0) * 100) / 100,
        created_at: r.created_at.slice(0, 10),
    }));
}

// ─── Outbreak Clusters ────────────────────────────────────────────────────────

export interface OutbreakCluster { species: string; lat: number; lon: number; count: number; avg_risk: number; level: 'monitoring' | 'elevated' | 'critical'; }

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function riskLevel(score: number): 'monitoring' | 'elevated' | 'critical' {
    return score >= 7 ? 'critical' : score >= 4 ? 'elevated' : 'monitoring';
}

export function detectOutbreakClusters(): OutbreakCluster[] {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const rows = getDb().prepare<[string], any>(`
        SELECT id, latitude, longitude, ai_tags, ai_summary, ai_risk_score
        FROM exif_data
        WHERE ai_analysed_at IS NOT NULL AND ai_label IN ('invasive-plant','invasive-animal')
          AND latitude IS NOT NULL AND longitude IS NOT NULL AND created_at >= ?
        ORDER BY created_at DESC
    `).all(cutoff);

    const assigned = new Set<number>(), clusters: OutbreakCluster[] = [];
    for (let i = 0; i < rows.length; i++) {
        if (assigned.has(rows[i].id)) continue;
        const seed = rows[i], seedSpecies = parseSpecies(seed.ai_tags, seed.ai_summary), members = [seed];
        assigned.add(seed.id);
        for (let j = i + 1; j < rows.length; j++) {
            if (assigned.has(rows[j].id)) continue;
            if (parseSpecies(rows[j].ai_tags, rows[j].ai_summary) !== seedSpecies) continue;
            if (haversineKm(seed.latitude, seed.longitude, rows[j].latitude, rows[j].longitude) <= 5) {
                members.push(rows[j]); assigned.add(rows[j].id);
            }
        }
        if (members.length >= 3) {
            const avgLat = members.reduce((s, r) => s + r.latitude, 0) / members.length;
            const avgLon = members.reduce((s, r) => s + r.longitude, 0) / members.length;
            const avgRisk = members.reduce((s, r) => s + (r.ai_risk_score ?? 0), 0) / members.length;
            clusters.push({ species: seedSpecies, lat: Math.round(avgLat * 1e5) / 1e5, lon: Math.round(avgLon * 1e5) / 1e5, count: members.length, avg_risk: Math.round(avgRisk * 10) / 10, level: riskLevel(avgRisk) });
        }
    }
    return clusters.sort((a, b) => b.avg_risk - a.avg_risk);
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export interface DistrictRow { district: string; state: string | null; country: string | null; report_count: number; invasive_count: number; avg_risk_score: number; risk_level: 'Monitoring' | 'Elevated' | 'Critical'; }
export interface OverviewStats { total_reports: number; invasive_count: number; high_risk_zones: number; avg_confidence: number; most_reported_species: string | null; active_clusters: number; }
export interface RiskDistribution { low: number; moderate: number; high: number; }
export interface DistrictFilter { district?: string | null; state?: string | null; country?: string | null; }
export interface DistrictListRow { country: string; state: string | null; district: string; }
export interface SpeciesDistrictRow { district: string; state: string | null; country: string | null; species: string; count: number; }
export interface TopDistrictRow { district: string; state: string | null; country: string | null; report_count: number; invasive_count: number; avg_risk: number; risk_level: 'Monitoring' | 'Elevated' | 'Critical'; }
export interface DailyTrendRow { day: string; date: string; count: number; }
export interface AlertRow { id: number; species: string | null; district: string | null; state: string | null; country: string | null; latitude: number | null; longitude: number | null; ai_risk_score: number | null; ai_confidence: number | null; ai_label: string | null; ai_analysed_at: string | null; }

function districtWhere(base: string, f?: DistrictFilter): { sql: string; params: (string | null)[] } {
    const clauses = [base], params: (string | null)[] = [];
    if (f?.country) { clauses.push("country = ?"); params.push(f.country); }
    if (f?.state) { clauses.push("state = ?"); params.push(f.state); }
    if (f?.district) { clauses.push("district = ?"); params.push(f.district); }
    return { sql: clauses.join(" AND "), params };
}

export function getDistrictDistribution(): DistrictRow[] {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    return getDb().prepare<[string], any>(`
        SELECT district, state, country, COUNT(*) AS report_count,
               SUM(CASE WHEN ai_label IN ('invasive-plant','invasive-animal') THEN 1 ELSE 0 END) AS invasive_count,
               ROUND(AVG(COALESCE(ai_risk_score,0)),1) AS avg_risk_score
        FROM exif_data WHERE district IS NOT NULL AND ai_analysed_at IS NOT NULL AND created_at >= ?
        GROUP BY district ORDER BY report_count DESC
    `).all(cutoff).map(r => ({ ...r, risk_level: r.avg_risk_score >= 7 ? 'Critical' : r.avg_risk_score >= 4 ? 'Elevated' : 'Monitoring' }));
}

export function getOverviewStats(f?: DistrictFilter): OverviewStats {
    const db = getDb();
    const { sql, params } = districtWhere("ai_analysed_at IS NOT NULL", f);
    const base = db.prepare<any[], any>(`SELECT COUNT(*) AS total, SUM(CASE WHEN ai_label IN ('invasive-plant','invasive-animal') THEN 1 ELSE 0 END) AS invasive, SUM(CASE WHEN ai_risk_score >= 7 THEN 1 ELSE 0 END) AS high_risk, ROUND(AVG(COALESCE(ai_confidence,0)),3) AS avg_conf FROM exif_data WHERE ${sql}`).get(...params);
    const speciesRow = db.prepare<any[], any>(`SELECT json_extract(ai_tags,'$[0]') AS species, COUNT(*) AS n FROM exif_data WHERE ${sql} AND ai_tags IS NOT NULL GROUP BY species ORDER BY n DESC LIMIT 1`).get(...params);
    return { total_reports: base?.total ?? 0, invasive_count: base?.invasive ?? 0, high_risk_zones: base?.high_risk ?? 0, avg_confidence: Math.round((base?.avg_conf ?? 0) * 100), most_reported_species: speciesRow?.species ?? null, active_clusters: detectOutbreakClusters().length };
}

export function getRiskDistribution(f?: DistrictFilter): RiskDistribution {
    const { sql, params } = districtWhere("ai_analysed_at IS NOT NULL", f);
    const row = getDb().prepare<any[], any>(`SELECT SUM(CASE WHEN ai_risk_score < 3.5 THEN 1 ELSE 0 END) AS low, SUM(CASE WHEN ai_risk_score >= 3.5 AND ai_risk_score <= 6.5 THEN 1 ELSE 0 END) AS moderate, SUM(CASE WHEN ai_risk_score > 6.5 THEN 1 ELSE 0 END) AS high FROM exif_data WHERE ${sql}`).get(...params);
    return { low: row?.low ?? 0, moderate: row?.moderate ?? 0, high: row?.high ?? 0 };
}

export function getDistrictList(): DistrictListRow[] {
    return getDb().prepare<[], DistrictListRow>("SELECT DISTINCT country, state, district FROM exif_data WHERE district IS NOT NULL AND ai_analysed_at IS NOT NULL AND country IS NOT NULL ORDER BY country, state, district").all();
}

export function getSpeciesByDistrict(): SpeciesDistrictRow[] {
    return getDb().prepare<[], SpeciesDistrictRow>(`SELECT district, state, country, json_extract(ai_tags,'$[0]') AS species, COUNT(*) AS count FROM exif_data WHERE district IS NOT NULL AND ai_analysed_at IS NOT NULL AND ai_tags IS NOT NULL AND json_extract(ai_tags,'$[0]') IS NOT NULL GROUP BY district, species ORDER BY district, count DESC`).all();
}

export function getTopDistricts(f?: Pick<DistrictFilter, 'country'>): TopDistrictRow[] {
    const clauses = ["ai_analysed_at IS NOT NULL", "district IS NOT NULL"], params: (string | null)[] = [];
    if (f?.country) { clauses.push("country = ?"); params.push(f.country); }
    return getDb().prepare<any[], any>(`SELECT district, state, country, COUNT(*) AS report_count, SUM(CASE WHEN ai_label IN ('invasive-plant','invasive-animal') THEN 1 ELSE 0 END) AS invasive_count, ROUND(AVG(COALESCE(ai_risk_score,0)),1) AS avg_risk FROM exif_data WHERE ${clauses.join(" AND ")} GROUP BY district ORDER BY avg_risk DESC LIMIT 10`).all(...params).map(r => ({ ...r, risk_level: r.avg_risk >= 7 ? 'Critical' : r.avg_risk >= 4 ? 'Elevated' : 'Monitoring' }));
}

export function getTimeTrends(f?: DistrictFilter, days = 30): DailyTrendRow[] {
    const db = getDb(), dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], result: DailyTrendRow[] = [];
    const { sql, params } = districtWhere("ai_analysed_at IS NOT NULL", f);
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86_400_000), dateStr = d.toISOString().slice(0, 10);
        const count = db.prepare<any[], { n: number }>(`SELECT COUNT(*) AS n FROM exif_data WHERE ${sql} AND created_at >= ? AND created_at < date(?,'+ 1 day')`).get(...params, `${dateStr}T00:00:00.000Z`, dateStr)?.n ?? 0;
        result.push({ day: dayNames[d.getDay()], date: dateStr, count });
    }
    return result;
}

export function getRecentAlerts(f?: DistrictFilter, limit = 20): AlertRow[] {
    const { sql, params } = districtWhere("ai_analysed_at IS NOT NULL AND ai_risk_score > 4", f);
    return getDb().prepare<any[], AlertRow>(`
        SELECT id, json_extract(ai_tags,'$[0]') AS species, district, state, country,
               latitude, longitude, ai_risk_score, ai_confidence, ai_label, ai_analysed_at
        FROM exif_data WHERE ${sql} ORDER BY ai_analysed_at DESC LIMIT ${limit}
    `).all(...params);
}
