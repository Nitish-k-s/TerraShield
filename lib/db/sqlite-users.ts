/**
 * lib/db/sqlite-users.ts
 * SQLite-backed user metadata and points system (better-sqlite3, synchronous)
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "lib", "db");
const DB_PATH = path.join(DB_DIR, "users.db");

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

declare global { var __usersDb: Database.Database | undefined; }

export function getUsersDb(): Database.Database {
    if (!global.__usersDb) {
        global.__usersDb = new Database(DB_PATH);
        global.__usersDb.pragma("journal_mode = WAL");
        global.__usersDb.pragma("foreign_keys = ON");
        initUsersSchema(global.__usersDb);
    }
    return global.__usersDb;
}

function initUsersSchema(db: Database.Database): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users_meta (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         TEXT UNIQUE NOT NULL,
            email           TEXT,
            name            TEXT,
            gender          TEXT,
            phone           TEXT,
            avatar_url      TEXT,
            terra_points    INTEGER DEFAULT 0,
            reports_count   INTEGER DEFAULT 0,
            verified_reports INTEGER DEFAULT 0,
            role            TEXT DEFAULT 'user',
            created_at      TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        );
        CREATE TABLE IF NOT EXISTS points_history (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    TEXT NOT NULL,
            amount     INTEGER NOT NULL,
            reason     TEXT NOT NULL,
            created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        );
        CREATE INDEX IF NOT EXISTS idx_users_meta_user_id    ON users_meta(user_id);
        CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
    `);
    for (const col of ["name TEXT","gender TEXT","phone TEXT","avatar_url TEXT","password_hash TEXT"]) {
        try { db.exec(`ALTER TABLE users_meta ADD COLUMN ${col}`); } catch { /* exists */ }
    }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserMeta {
    id: number; user_id: string; email: string;
    name?: string | null; gender?: string | null; phone?: string | null; avatar_url?: string | null;
    terra_points: number; reports_count: number; verified_reports: number; role: string; created_at: string;
    level?: string; next_level_at?: number | null; level_progress_pct?: number;
}

export interface PointHistory { id: number; user_id: string; amount: number; reason: string; created_at: string; }

// ─── Level System ─────────────────────────────────────────────────────────────

export function calculateUserLevel(points: number): string {
    if (points >= 301) return 'Guardian';
    if (points >= 151) return 'Protector';
    if (points >= 51) return 'Defender';
    return 'Observer';
}

export function nextLevelThreshold(points: number): number | null {
    if (points < 51) return 51;
    if (points < 151) return 151;
    if (points < 301) return 301;
    return null;
}

export function levelProgressPct(points: number): number {
    if (points >= 301) return 100;
    if (points >= 151) return Math.round(((points - 151) / 150) * 100);
    if (points >= 51) return Math.round(((points - 51) / 100) * 100);
    return Math.round((points / 51) * 100);
}

function withLevel(user: UserMeta): UserMeta {
    const pts = user.terra_points ?? 0;
    return { ...user, level: calculateUserLevel(pts), next_level_at: nextLevelThreshold(pts), level_progress_pct: levelProgressPct(pts) };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function getUserMeta(userId: string, email: string): UserMeta {
    const db = getUsersDb();
    let user = db.prepare("SELECT * FROM users_meta WHERE user_id = ?").get(userId) as UserMeta | undefined;
    if (!user) {
        db.transaction(() => {
            db.prepare("INSERT INTO users_meta (user_id, email, terra_points) VALUES (?, ?, 50)").run(userId, email);
            db.prepare("INSERT INTO points_history (user_id, amount, reason) VALUES (?, 50, 'Welcome to TerraShield')").run(userId);
        })();
        user = db.prepare("SELECT * FROM users_meta WHERE user_id = ?").get(userId) as UserMeta;
    }
    return withLevel(user);
}

export function getUserMetaById(userId: string): UserMeta | null {
    const user = getUsersDb().prepare("SELECT * FROM users_meta WHERE user_id = ?").get(userId) as UserMeta | undefined;
    return user ? withLevel(user) : null;
}

export function updateProfileContent(userId: string, data: Partial<UserMeta>): void {
    const db = getUsersDb();
    const updates: string[] = [], values: unknown[] = [];
    for (const col of ['name','gender','phone','avatar_url'] as const) {
        if (data[col] !== undefined) { updates.push(`${col} = ?`); values.push(data[col]); }
    }
    if (updates.length > 0) {
        values.push(userId);
        db.prepare(`UPDATE users_meta SET ${updates.join(', ')} WHERE user_id = ?`).run(...values);
    }
}

export function getPointHistory(userId: string): PointHistory[] {
    return getUsersDb().prepare("SELECT * FROM points_history WHERE user_id = ? ORDER BY created_at DESC").all(userId) as PointHistory[];
}

export function addTerraPoints(userId: string, amount: number, reason: string): void {
    const db = getUsersDb();
    db.transaction(() => {
        db.prepare("UPDATE users_meta SET terra_points = terra_points + ? WHERE user_id = ?").run(amount, userId);
        db.prepare("INSERT INTO points_history (user_id, amount, reason) VALUES (?, ?, ?)").run(userId, amount, reason);
    })();
}

export function calcPoints(aiLabel: string, aiConfidence: number): number {
    if ((aiLabel !== 'invasive-plant' && aiLabel !== 'invasive-animal') || aiConfidence <= 0.70) return 0;
    if (aiConfidence >= 0.95) return 30;
    if (aiConfidence >= 0.85) return 20;
    return 10;
}

export function awardReportPoints(userId: string, exifRecordId: number, aiLabel: string, aiConfidence: number, isVerified = false): { pointsAwarded: number; updatedUser: UserMeta | null } {
    const db = getUsersDb();
    const idempotencyKey = `report:${exifRecordId}`;
    let pointsAwarded = 0, updatedUser: UserMeta | null = null;

    db.transaction(() => {
        const user = db.prepare("SELECT * FROM users_meta WHERE user_id = ?").get(userId) as UserMeta | undefined;
        if (!user) return;
        if (db.prepare("SELECT id FROM points_history WHERE user_id = ? AND reason = ?").get(userId, idempotencyKey)) return;

        const pts = calcPoints(aiLabel, aiConfidence);
        pointsAwarded = pts;
        db.prepare("UPDATE users_meta SET reports_count = reports_count + 1 WHERE user_id = ?").run(userId);
        if (pts > 0) db.prepare("UPDATE users_meta SET terra_points = terra_points + ? WHERE user_id = ?").run(pts, userId);
        db.prepare("INSERT INTO points_history (user_id, amount, reason) VALUES (?, ?, ?)").run(userId, pts, idempotencyKey);
        if (isVerified) db.prepare("UPDATE users_meta SET verified_reports = verified_reports + 1 WHERE user_id = ?").run(userId);
        updatedUser = withLevel(db.prepare("SELECT * FROM users_meta WHERE user_id = ?").get(userId) as UserMeta);
    })();

    return { pointsAwarded, updatedUser };
}
