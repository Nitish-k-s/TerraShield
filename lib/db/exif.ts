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

function getDb(): Database.Database {
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
    // SQLite does not support IF NOT EXISTS on ALTER TABLE, so we catch the
    // duplicate-column error and ignore it.
    try { db.exec("ALTER TABLE exif_data ADD COLUMN image_data BLOB"); } catch { /* already exists */ }
    try { db.exec("ALTER TABLE exif_data ADD COLUMN satellite_context_json TEXT"); } catch { /* already exists */ }
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
