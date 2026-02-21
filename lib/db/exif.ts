/**
 * lib/db/exif.ts
 *
 * Local SQLite database for storing EXIF data extracted from uploaded images.
 * The database file is created automatically at `lib/db/exif.db` on first use.
 *
 * Library: better-sqlite3 (synchronous, zero-dependency SQLite for Node.js)
 *
 * Table: exif_data
 * ─────────────────────────────────────────────────────────────────────────────
 * Each row stores one image's full EXIF snapshot alongside structured GPS
 * fields and AI-ready metadata so downstream models can query them directly.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// ─── Database path ────────────────────────────────────────────────────────────
// Stored at <project-root>/lib/db/exif.db  (auto-created on first run)
const DB_DIR = path.join(process.cwd(), "lib", "db");
const DB_PATH = path.join(DB_DIR, "exif.db");

// Ensure the directory exists (Next.js may run from the project root)
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// ─── Singleton connection ─────────────────────────────────────────────────────
// In Next.js we may be hot-reloading, so we cache the connection on the global
// object to avoid opening multiple handles in development.
declare global {
    // eslint-disable-next-line no-var
    var __exifDb: Database.Database | undefined;
}

export function getDb(): Database.Database {
    if (!global.__exifDb) {
        global.__exifDb = new Database(DB_PATH);
        // Enable WAL mode for better concurrent read performance
        global.__exifDb.pragma("journal_mode = WAL");
        global.__exifDb.pragma("foreign_keys = ON");
        initSchema(global.__exifDb);
    }
    return global.__exifDb;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

function initSchema(db: Database.Database): void {
    db.exec(/* sql */ `
        CREATE TABLE IF NOT EXISTS exif_data (
            -- Primary key
            id              INTEGER PRIMARY KEY AUTOINCREMENT,

            -- ── Identity ────────────────────────────────────────────────────
            user_id         TEXT        NOT NULL,           -- Supabase auth user ID
            filename        TEXT        NOT NULL,
            mime_type       TEXT        NOT NULL,
            file_size_bytes INTEGER,                        -- optional, bytes

            -- ── GPS / Location ───────────────────────────────────────────────
            latitude        REAL,                           -- decimal degrees, WGS-84
            longitude       REAL,                           -- decimal degrees, WGS-84
            altitude        REAL,                           -- metres above sea level
            latitude_ref    TEXT,                           -- "N" or "S"
            longitude_ref   TEXT,                           -- "E" or "W"
            maps_url        TEXT,                           -- Google Maps deep-link

            -- ── Camera / Device ──────────────────────────────────────────────
            make            TEXT,                           -- e.g. "Apple"
            model           TEXT,                           -- e.g. "iPhone 15 Pro"
            software        TEXT,
            date_time       TEXT,                           -- original capture datetime (ISO-like string)
            exposure_time   TEXT,                           -- e.g. "1/1000"
            f_number        REAL,                           -- aperture, e.g. 1.8
            iso             INTEGER,
            focal_length    REAL,                           -- mm
            flash           TEXT,

            -- ── Image Properties ─────────────────────────────────────────────
            image_width     INTEGER,
            image_height    INTEGER,
            orientation     INTEGER,                        -- EXIF orientation tag (1-8)
            color_space     TEXT,

            -- ── Image Binary ─────────────────────────────────────────────────
            -- Raw image bytes stored so Gemini Vision can analyse the actual
            -- pixels, not just the EXIF metadata text.
            image_data      BLOB,                           -- original image bytes

            -- ── AI Analysis Fields ───────────────────────────────────────────
            -- These columns are LEFT NULL at insert time and filled in by the
            -- AI analysis pipeline later.
            ai_label        TEXT,                           -- top-level classification, e.g. "invasive-plant"
            ai_confidence   REAL,                           -- 0.0 – 1.0
            ai_tags         TEXT,                           -- JSON array: ["kudzu","riparian","high-spread"]
            ai_summary      TEXT,                           -- free-text description from model
            ai_risk_score   REAL,                           -- 0.0 – 10.0  (environmental risk)
            ai_analysed_at  TEXT,                           -- ISO-8601 datetime of analysis run

            -- ── Raw Payload ──────────────────────────────────────────────────
            all_tags_json   TEXT        NOT NULL DEFAULT '{}',  -- full EXIF dump as JSON
            satellite_context_json TEXT,                        -- JSON dump of the Sentinel Hub fetch

            -- ── Audit ────────────────────────────────────────────────────────
            created_at      TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            updated_at      TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );

        -- Keep updated_at current on every UPDATE
        CREATE TRIGGER IF NOT EXISTS trg_exif_data_updated_at
        AFTER UPDATE ON exif_data
        BEGIN
            UPDATE exif_data
            SET    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
            WHERE  id = NEW.id;
        END;

        -- Index for fast per-user lookups
        CREATE INDEX IF NOT EXISTS idx_exif_data_user_id   ON exif_data (user_id);
        -- Index for spatial / geo queries
        CREATE INDEX IF NOT EXISTS idx_exif_data_lat_lng   ON exif_data (latitude, longitude);
        -- Index for AI result searches
        CREATE INDEX IF NOT EXISTS idx_exif_data_ai_label  ON exif_data (ai_label);
    `);

    // ── Safe migration for existing databases ────────────────────────────────
    try { db.exec("ALTER TABLE exif_data ADD COLUMN image_data BLOB"); } catch { /* already exists */ }
    try { db.exec("ALTER TABLE exif_data ADD COLUMN satellite_context_json TEXT"); } catch { /* already exists */ }
    // District geocoding columns
    try { db.exec("ALTER TABLE exif_data ADD COLUMN district TEXT"); } catch { /* already exists */ }
    try { db.exec("ALTER TABLE exif_data ADD COLUMN state    TEXT"); } catch { /* already exists */ }
    try { db.exec("ALTER TABLE exif_data ADD COLUMN country  TEXT"); } catch { /* already exists */ }

    // ── Performance indexes (idempotent) ─────────────────────────────────────
    try { db.exec("CREATE INDEX IF NOT EXISTS idx_exif_ai_label ON exif_data (ai_label)"); } catch { /* ok */ }
    try { db.exec("CREATE INDEX IF NOT EXISTS idx_exif_analysed_at ON exif_data (ai_analysed_at)"); } catch { /* ok */ }
    try { db.exec("CREATE INDEX IF NOT EXISTS idx_exif_created_at ON exif_data (created_at)"); } catch { /* ok */ }
    try { db.exec("CREATE INDEX IF NOT EXISTS idx_exif_district ON exif_data (district)"); } catch { /* ok */ }
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** Columns written at insert time (everything except AI fields and audit cols). */
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

    // Raw
    all_tags_json: string; // JSON.stringify(allTags)

    // Image binary (stored as BLOB; typed as Buffer in Node.js)
    image_data?: Buffer | null;

    // Reverse-geocoded location (set at insert time, NULL if GPS absent)
    district?: string | null;
    state?: string | null;
    country?: string | null;
}

/** AI analysis fields applied via updateAiAnalysis(). */
export interface AiAnalysisUpdate {
    ai_label?: string | null;
    ai_confidence?: number | null;
    ai_tags?: string | null;       // JSON array string
    ai_summary?: string | null;
    ai_risk_score?: number | null;
    ai_analysed_at?: string | null;
    satellite_context_json?: string | null; // JSON dump of Sentinel API context
}

/** Full row as returned by the database. */
export interface ExifRecord extends InsertExifRecord, AiAnalysisUpdate {
    id: number;
    created_at: string;
    updated_at: string;
}

// ─── CRUD helpers ─────────────────────────────────────────────────────────────

/**
 * Insert a new EXIF record extracted from an uploaded image.
 * Returns the auto-generated `id`.
 */
export function insertExifRecord(data: InsertExifRecord): number {
    const db = getDb();

    const stmt = db.prepare<InsertExifRecord>(/* sql */ `
        INSERT INTO exif_data (
            user_id, filename, mime_type, file_size_bytes,
            latitude, longitude, altitude, latitude_ref, longitude_ref, maps_url,
            make, model, software, date_time, exposure_time,
            f_number, iso, focal_length, flash,
            image_width, image_height, orientation, color_space,
            all_tags_json, image_data
        ) VALUES (
            @user_id, @filename, @mime_type, @file_size_bytes,
            @latitude, @longitude, @altitude, @latitude_ref, @longitude_ref, @maps_url,
            @make, @model, @software, @date_time, @exposure_time,
            @f_number, @iso, @focal_length, @flash,
            @image_width, @image_height, @orientation, @color_space,
            @all_tags_json, @image_data
        )
    `);

    const result = stmt.run(data);
    return result.lastInsertRowid as number;
}

/**
 * Writes the reverse-geocoded location onto an already-inserted exif_data row.
 * Called after insertExifRecord so a geocoding failure never blocks submission.
 */
export function updateExifDistrict(
    id: number,
    district: string | null,
    state: string | null,
    country: string | null
): void {
    getDb().prepare<[string | null, string | null, string | null, number]>(
        "UPDATE exif_data SET district = ?, state = ?, country = ? WHERE id = ?"
    ).run(district, state, country, id);
}

/**
 * Retrieve a single EXIF record by its primary key.
 */
export function getExifById(id: number): ExifRecord | undefined {
    return getDb()
        .prepare<[number], ExifRecord>("SELECT * FROM exif_data WHERE id = ?")
        .get(id);
}

/**
 * Retrieve all EXIF records for a specific user, newest first.
 */
export function getExifByUser(userId: string): ExifRecord[] {
    return getDb()
        .prepare<[string], ExifRecord>(
            "SELECT * FROM exif_data WHERE user_id = ? ORDER BY created_at DESC"
        )
        .all(userId);
}

/**
 * Return all records that have not yet been analysed by AI.
 * Useful for batch-processing queues.
 */
export function getPendingAiAnalysis(): ExifRecord[] {
    return getDb()
        .prepare<[], ExifRecord>(
            "SELECT * FROM exif_data WHERE ai_analysed_at IS NULL ORDER BY created_at ASC"
        )
        .all();
}

/**
 * Persist the AI analysis result onto an existing EXIF record.
 */
export function updateAiAnalysis(id: number, update: AiAnalysisUpdate): void {
    const db = getDb();
    db.prepare<[AiAnalysisUpdate & { id: number }]>(/* sql */ `
        UPDATE exif_data
        SET
            ai_label       = @ai_label,
            ai_confidence  = @ai_confidence,
            ai_tags        = @ai_tags,
            ai_summary     = @ai_summary,
            ai_risk_score  = @ai_risk_score,
            ai_analysed_at = @ai_analysed_at,
            satellite_context_json = @satellite_context_json
        WHERE id = @id
    `).run({ ...update, id });
}

/**
 * Delete a record by id (e.g. after the user removes the image).
 */
export function deleteExifRecord(id: number): void {
    getDb()
        .prepare<[number]>("DELETE FROM exif_data WHERE id = ?")
        .run(id);
}

/**
 * Return total record count — handy for admin dashboards / health checks.
 */
export function countExifRecords(): number {
    const row = getDb()
        .prepare<[], { total: number }>("SELECT COUNT(*) AS total FROM exif_data")
        .get();
    return row?.total ?? 0;
}

// ─── Public Report Types ─────────────────────────────────────────────────────

export interface PublicReport {
    id: number;
    lat: number;
    lon: number;
    species: string;
    risk_score: number;
    confidence: number;
    created_at: string;
}

export interface OutbreakCluster {
    species: string;
    lat: number;
    lon: number;
    count: number;
    avg_risk: number;
    level: 'monitoring' | 'elevated' | 'critical';
}

/** Extract inferred species name from ai_tags JSON array or ai_summary. */
function parseSpecies(ai_tags: string | null, ai_summary: string | null): string {
    if (ai_tags) {
        try {
            const tags: string[] = JSON.parse(ai_tags);
            // First tag that looks like a species name (contains a space or is capitalised)
            const species = tags.find(t => /^[A-Z]/.test(t) || t.includes(' '));
            if (species) return species;
            if (tags.length > 0) return tags[0];
        } catch { /* fall through */ }
    }
    if (ai_summary) {
        // Take first sentence / first 40 chars as species hint
        const match = ai_summary.match(/^([A-Z][a-z]+ [a-z]+)/);
        if (match) return match[1];
    }
    return 'Unknown species';
}

/** Haversine distance in km between two lat/lng points. */
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

/** Risk level from 0-10 score. */
function riskLevel(score: number): 'monitoring' | 'elevated' | 'critical' {
    if (score >= 7) return 'critical';
    if (score >= 4) return 'elevated';
    return 'monitoring';
}

/**
 * Returns safe public fields for all analysed invasive reports (last 30 days).
 * NO user_id, email, image_data, or internal metadata exposed.
 */
export function getPublicReports(): PublicReport[] {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const rows = getDb().prepare<[string], {
        id: number; latitude: number; longitude: number;
        ai_tags: string | null; ai_summary: string | null;
        ai_risk_score: number | null; ai_confidence: number | null;
        created_at: string;
    }>(`
        SELECT id, latitude, longitude, ai_tags, ai_summary,
               ai_risk_score, ai_confidence, created_at
        FROM   exif_data
        WHERE  ai_analysed_at IS NOT NULL
          AND  ai_label IN ('invasive-plant', 'invasive-animal')
          AND  latitude  IS NOT NULL
          AND  longitude IS NOT NULL
          AND  created_at >= ?
        ORDER BY created_at DESC
        LIMIT 200
    `).all(cutoff);

    return rows.map(r => ({
        id: r.id,
        lat: r.latitude,
        lon: r.longitude,
        species: parseSpecies(r.ai_tags, r.ai_summary),
        risk_score: Math.round((r.ai_risk_score ?? 0) * 10) / 10,
        confidence: Math.round((r.ai_confidence ?? 0) * 100) / 100,
        created_at: r.created_at.slice(0, 10),   // yyyy-mm-dd only
    }));
}

/**
 * Groups public reports into spatial clusters:
 *  - same first-tag species
 *  - within 5 km radius
 *  - within last 7 days
 *  - at least CLUSTER_THRESHOLD reports in cluster
 *
 * Returns clusters sorted by avg risk score descending.
 */
const CLUSTER_THRESHOLD = 3;
const CLUSTER_RADIUS_KM = 5;
const CLUSTER_WINDOW_DAYS = 7;

export function detectOutbreakClusters(): OutbreakCluster[] {
    const cutoff = new Date(Date.now() - CLUSTER_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const rows = getDb().prepare<[string], {
        id: number; latitude: number; longitude: number;
        ai_tags: string | null; ai_summary: string | null;
        ai_risk_score: number | null;
    }>(`
        SELECT id, latitude, longitude, ai_tags, ai_summary, ai_risk_score
        FROM   exif_data
        WHERE  ai_analysed_at IS NOT NULL
          AND  ai_label IN ('invasive-plant', 'invasive-animal')
          AND  latitude  IS NOT NULL
          AND  longitude IS NOT NULL
          AND  created_at >= ?
        ORDER BY created_at DESC
    `).all(cutoff);

    // Greedy cluster assignment
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
            const dist = haversineKm(seed.latitude, seed.longitude, candidate.latitude, candidate.longitude);
            if (dist <= CLUSTER_RADIUS_KM) {
                members.push(candidate);
                assigned.add(candidate.id);
            }
        }

        if (members.length >= CLUSTER_THRESHOLD) {
            const avgLat = members.reduce((s, r) => s + r.latitude, 0) / members.length;
            const avgLon = members.reduce((s, r) => s + r.longitude, 0) / members.length;
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

// ─── District Distribution ────────────────────────────────────────────────────

export interface DistrictRow {
    district: string;
    state: string | null;
    country: string | null;
    report_count: number;
    invasive_count: number;
    avg_risk_score: number;
    risk_level: 'Monitoring' | 'Elevated' | 'Critical';
}

/**
 * Aggregates analysed reports by district (last 30 days).
 * Risk level is computed server-side — never in the frontend.
 * Returns rows ordered by report_count DESC.
 */
export function getDistrictDistribution(): DistrictRow[] {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const rows = getDb().prepare<[string], {
        district: string;
        state: string | null;
        country: string | null;
        report_count: number;
        invasive_count: number;
        avg_risk_score: number | null;
    }>(`
        SELECT
            district,
            state,
            country,
            COUNT(*)                                                              AS report_count,
            SUM(CASE WHEN ai_label IN ('invasive-plant','invasive-animal') THEN 1 ELSE 0 END) AS invasive_count,
            ROUND(AVG(COALESCE(ai_risk_score, 0)), 1)                             AS avg_risk_score
        FROM   exif_data
        WHERE  district         IS NOT NULL
          AND  ai_analysed_at   IS NOT NULL
          AND  created_at       >= ?
        GROUP  BY district
        ORDER  BY report_count DESC
    `).all(cutoff);

    return rows.map(r => {
        const score = r.avg_risk_score ?? 0;
        const risk_level: DistrictRow['risk_level'] =
            score >= 7 ? 'Critical' :
                score >= 4 ? 'Elevated' :
                    'Monitoring';
        return {
            district: r.district,
            state: r.state,
            country: r.country,
            report_count: r.report_count,
            invasive_count: r.invasive_count,
            avg_risk_score: score,
            risk_level,
        };
    });
}

// ─── District Filter Type ─────────────────────────────────────────────────────

export interface DistrictFilter {
    district?: string | null;
    state?: string | null;
    country?: string | null;
}

/** Build a WHERE clause fragment + params for optional district/state/country filtering. */
function districtWhere(base: string, f?: DistrictFilter): { sql: string; params: (string | null)[] } {
    const clauses: string[] = [base];
    const params: (string | null)[] = [];
    if (f?.country) { clauses.push("country = ?"); params.push(f.country); }
    if (f?.state) { clauses.push("state = ?"); params.push(f.state); }
    if (f?.district) { clauses.push("district = ?"); params.push(f.district); }
    return { sql: clauses.join(" AND "), params };
}

// ─── District List ────────────────────────────────────────────────────────────

export interface DistrictListRow { country: string; state: string | null; district: string; }

export function getDistrictList(): DistrictListRow[] {
    return getDb().prepare<[], DistrictListRow>(`
        SELECT DISTINCT country, state, district
        FROM   exif_data
        WHERE  district IS NOT NULL
          AND  ai_analysed_at IS NOT NULL
          AND  country IS NOT NULL
        ORDER  BY country, state, district
    `).all();
}

// ─── Overview Stats ───────────────────────────────────────────────────────────

export interface OverviewStats {
    total_reports: number;
    invasive_count: number;
    high_risk_zones: number;
    avg_confidence: number;
    most_reported_species: string | null;
    active_clusters: number;
}

export function getOverviewStats(f?: DistrictFilter): OverviewStats {
    const db = getDb();
    const { sql, params } = districtWhere(
        "ai_analysed_at IS NOT NULL",
        f
    );

    const base = db.prepare<unknown[], {
        total: number; invasive: number; high_risk: number; avg_conf: number | null;
    }>(`
        SELECT COUNT(*)                                                                   AS total,
               SUM(CASE WHEN ai_label IN ('invasive-plant','invasive-animal') THEN 1 ELSE 0 END) AS invasive,
               SUM(CASE WHEN ai_risk_score >= 7 THEN 1 ELSE 0 END)                      AS high_risk,
               ROUND(AVG(COALESCE(ai_confidence, 0)), 3)                                 AS avg_conf
        FROM   exif_data
        WHERE  ${sql}
    `).get(...params);

    // Most reported species from ai_tags JSON
    const speciesRow = db.prepare<unknown[], { species: string; n: number }>(`
        SELECT json_extract(ai_tags, '$[0]') AS species, COUNT(*) AS n
        FROM   exif_data
        WHERE  ${sql}
          AND  ai_tags IS NOT NULL
        GROUP  BY species
        ORDER  BY n DESC
        LIMIT  1
    `).get(...params);

    return {
        total_reports: base?.total ?? 0,
        invasive_count: base?.invasive ?? 0,
        high_risk_zones: base?.high_risk ?? 0,
        avg_confidence: Math.round((base?.avg_conf ?? 0) * 100),
        most_reported_species: speciesRow?.species ?? null,
        active_clusters: detectOutbreakClusters().length,
    };
}

// ─── Risk Distribution ────────────────────────────────────────────────────────

export interface RiskDistribution { low: number; moderate: number; high: number; }

export function getRiskDistribution(f?: DistrictFilter): RiskDistribution {
    const { sql, params } = districtWhere("ai_analysed_at IS NOT NULL", f);
    const row = getDb().prepare<unknown[], { low: number; moderate: number; high: number }>(`
        SELECT
            SUM(CASE WHEN ai_risk_score <  3.5 THEN 1 ELSE 0 END) AS low,
            SUM(CASE WHEN ai_risk_score >= 3.5 AND ai_risk_score <= 6.5 THEN 1 ELSE 0 END) AS moderate,
            SUM(CASE WHEN ai_risk_score >  6.5 THEN 1 ELSE 0 END) AS high
        FROM exif_data
        WHERE ${sql}
    `).get(...params);
    return { low: row?.low ?? 0, moderate: row?.moderate ?? 0, high: row?.high ?? 0 };
}

// ─── Species by District ──────────────────────────────────────────────────────

export interface SpeciesDistrictRow {
    district: string;
    state: string | null;
    country: string | null;
    species: string;
    count: number;
}

export function getSpeciesByDistrict(): SpeciesDistrictRow[] {
    return getDb().prepare<[], SpeciesDistrictRow>(`
        SELECT district,
               state,
               country,
               json_extract(ai_tags, '$[0]') AS species,
               COUNT(*)                       AS count
        FROM   exif_data
        WHERE  district         IS NOT NULL
          AND  ai_analysed_at   IS NOT NULL
          AND  ai_tags          IS NOT NULL
          AND  json_extract(ai_tags, '$[0]') IS NOT NULL
        GROUP  BY district, species
        ORDER  BY district, count DESC
    `).all();
}

// ─── Top Districts ────────────────────────────────────────────────────────────

export interface TopDistrictRow {
    district: string;
    state: string | null;
    country: string | null;
    report_count: number;
    invasive_count: number;
    avg_risk: number;
    risk_level: 'Monitoring' | 'Elevated' | 'Critical';
}

export function getTopDistricts(f?: Pick<DistrictFilter, 'country'>): TopDistrictRow[] {
    const clauses = ["ai_analysed_at IS NOT NULL", "district IS NOT NULL"];
    const params: (string | null)[] = [];
    if (f?.country) { clauses.push("country = ?"); params.push(f.country); }

    const rows = getDb().prepare<unknown[], {
        district: string; state: string | null; country: string | null;
        report_count: number; invasive_count: number; avg_risk: number | null;
    }>(`
        SELECT district, state, country,
               COUNT(*)                                                                        AS report_count,
               SUM(CASE WHEN ai_label IN ('invasive-plant','invasive-animal') THEN 1 ELSE 0 END) AS invasive_count,
               ROUND(AVG(COALESCE(ai_risk_score, 0)), 1)                                      AS avg_risk
        FROM   exif_data
        WHERE  ${clauses.join(" AND ")}
        GROUP  BY district
        ORDER  BY avg_risk DESC
        LIMIT  10
    `).all(...params);

    return rows.map(r => {
        const score = r.avg_risk ?? 0;
        return {
            ...r,
            avg_risk: score,
            risk_level: (score >= 7 ? 'Critical' : score >= 4 ? 'Elevated' : 'Monitoring') as TopDistrictRow['risk_level'],
        };
    });
}

// ─── Time Trends ─────────────────────────────────────────────────────────────

export interface DailyTrendRow { day: string; date: string; count: number; }

export function getTimeTrends(f?: DistrictFilter, days = 30): DailyTrendRow[] {
    const db = getDb();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: DailyTrendRow[] = [];

    const { sql: baseWhere, params: baseParams } = districtWhere("ai_analysed_at IS NOT NULL", f);

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86_400_000);
        const dateStr = d.toISOString().slice(0, 10);
        const count = (db.prepare<unknown[], { n: number }>(`
            SELECT COUNT(*) AS n
            FROM   exif_data
            WHERE  ${baseWhere}
              AND  created_at >= ?
              AND  created_at <  date(?, '+1 day')
        `).get(...baseParams, `${dateStr}T00:00:00.000Z`, dateStr)?.n) ?? 0;
        result.push({ day: dayNames[d.getDay()], date: dateStr, count });
    }
    return result;
}

// ─── Recent Alerts ────────────────────────────────────────────────────────────

export interface AlertRow {
    id: number;
    species: string | null;
    district: string | null;
    state: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
    ai_risk_score: number | null;
    ai_confidence: number | null;
    ai_label: string | null;
    ai_analysed_at: string | null;
}

export function getRecentAlerts(f?: DistrictFilter, limit = 20): AlertRow[] {
    const { sql, params } = districtWhere(
        "ai_analysed_at IS NOT NULL AND ai_risk_score > 4",
        f
    );
    return getDb().prepare<unknown[], AlertRow>(`
        SELECT id,
               json_extract(ai_tags, '$[0]') AS species,
               district, state, country,
               latitude, longitude,
               ai_risk_score, ai_confidence, ai_label,
               ai_analysed_at
        FROM   exif_data
        WHERE  ${sql}
        ORDER  BY ai_analysed_at DESC
        LIMIT  ${limit}
    `).all(...params);
}
