import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "lib", "db");
const DB_PATH = path.join(DB_DIR, "users.db");

if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

declare global { // eslint-disable-next-line no-var
    var __usersDb: Database.Database | undefined;
}

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
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            email TEXT,
            name TEXT,
            gender TEXT,
            phone TEXT,
            avatar_url TEXT,
            terra_points INTEGER DEFAULT 0,
            reports_count INTEGER DEFAULT 0,
            verified_reports INTEGER DEFAULT 0,
            role TEXT DEFAULT 'user',
            created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );

        CREATE TABLE IF NOT EXISTS points_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            amount INTEGER NOT NULL,
            reason TEXT NOT NULL,
            created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
        CREATE INDEX IF NOT EXISTS idx_users_meta_user_id ON users_meta(user_id);
        CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
    `);

    // Safe migrations for existing databases
    const columns = ['name', 'gender', 'phone', 'avatar_url'];
    for (const col of columns) {
        try {
            db.exec("ALTER TABLE users_meta ADD COLUMN " + col + " TEXT");
        } catch { /* already exists */ }
    }
}

export interface UserMeta {
    id: number;
    user_id: string;
    email: string;
    name?: string | null;
    gender?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    terra_points: number;
    reports_count: number;
    verified_reports: number;
    role: string;
    created_at: string;
    // Virtual — computed on read, not stored in DB
    level?: string;
    next_level_at?: number | null;
    level_progress_pct?: number;
}

// ─── Level System ─────────────────────────────────────────────────────────────

/** Single source of truth for level calculation. */
export function calculateUserLevel(points: number): string {
    if (points >= 301) return 'Guardian';
    if (points >= 151) return 'Protector';
    if (points >= 51) return 'Defender';
    return 'Observer';
}

/** Points threshold for the next level, or null if already at max. */
export function nextLevelThreshold(points: number): number | null {
    if (points < 51) return 51;
    if (points < 151) return 151;
    if (points < 301) return 301;
    return null; // Guardian — max level
}

/** Progress (0–100) towards the next level threshold. */
export function levelProgressPct(points: number): number {
    if (points >= 301) return 100;
    if (points >= 151) return Math.round(((points - 151) / (301 - 151)) * 100);
    if (points >= 51) return Math.round(((points - 51) / (151 - 51)) * 100);
    return Math.round((points / 51) * 100);
}

/** Attaches computed level fields to a UserMeta row. */
function withLevel(user: UserMeta): UserMeta {
    const pts = user.terra_points ?? 0;
    return {
        ...user,
        level: calculateUserLevel(pts),
        next_level_at: nextLevelThreshold(pts),
        level_progress_pct: levelProgressPct(pts),
    };
}

export interface PointHistory {
    id: number;
    user_id: string;
    amount: number;
    reason: string;
    created_at: string;
}

export function getUserMeta(userId: string, email: string): UserMeta {
    const db = getUsersDb();
    let user = db.prepare("SELECT * FROM users_meta WHERE user_id = ?").get(userId) as UserMeta | undefined;
    if (!user) {
        // Auto-create user meta on first fetch with a welcome bonus
        const tx = db.transaction(() => {
            db.prepare("INSERT INTO users_meta (user_id, email, terra_points) VALUES (?, ?, 50)").run(userId, email);
            db.prepare("INSERT INTO points_history (user_id, amount, reason) VALUES (?, ?, 'Welcome to TerraShield')").run(userId, 50);
        });
        tx();
        user = db.prepare("SELECT * FROM users_meta WHERE user_id = ?").get(userId) as UserMeta;
    }
    return withLevel(user);
}

export function updateProfileContent(userId: string, data: Partial<UserMeta>): void {
    const db = getUsersDb();
    const updates: string[] = [];
    const values: string[] = [];

    const cols = ['name', 'gender', 'phone', 'avatar_url'];
    for (const col of cols) {
        const val = data[col as keyof UserMeta];
        if (val !== undefined) {
            updates.push(col + " = ?");
            values.push(val as string);
        }
    }

    if (updates.length > 0) {
        values.push(userId);
        const setString = updates.join(', ');
        const query = "UPDATE users_meta SET " + setString + " WHERE user_id = ?";
        db.prepare(query).run(...values);
    }
}

export function getPointHistory(userId: string): PointHistory[] {
    return getUsersDb().prepare("SELECT * FROM points_history WHERE user_id = ? ORDER BY created_at DESC").all(userId) as PointHistory[];
}

export function addTerraPoints(userId: string, amount: number, reason: string): void {
    const db = getUsersDb();
    const tx = db.transaction(() => {
        db.prepare("UPDATE users_meta SET terra_points = terra_points + ? WHERE user_id = ?").run(amount, userId);
        db.prepare("INSERT INTO points_history (user_id, amount, reason) VALUES (?, ?, ?)").run(userId, amount, reason);
    });
    tx();
}

export function getUserMetaById(userId: string): UserMeta | undefined {
    const user = getUsersDb()
        .prepare("SELECT * FROM users_meta WHERE user_id = ?")
        .get(userId) as UserMeta | undefined;
    return user ? withLevel(user) : undefined;
}

/**
 * Calculates how many TerraPoints to award based on confidence tier.
 * Returns 0 if criteria not met (confidence <= 0.70 or not invasive).
 */
export function calcPoints(aiLabel: string, aiConfidence: number): number {
    const isInvasive = aiLabel === 'invasive-plant' || aiLabel === 'invasive-animal';
    if (!isInvasive || aiConfidence <= 0.70) return 0;
    if (aiConfidence >= 0.95) return 30;
    if (aiConfidence >= 0.85) return 20;
    return 10; // 0.70 < confidence < 0.85
}

/**
 * Atomically awards TerraPoints for a single analysed report.
 *
 * Guards:
 *  - Checks points_history for an existing entry matching this exif record
 *    to prevent double-awarding on re-analysis.
 *  - Skips if user_id does not exist in users_meta.
 *  - Uses a transaction so all four writes are atomic.
 *
 * @param userId       Supabase user UUID
 * @param exifRecordId The exif_data.id being rewarded
 * @param aiLabel      e.g. 'invasive-plant'
 * @param aiConfidence 0.0–1.0
 * @param isVerified   Whether this report has been expert-verified
 * @returns { pointsAwarded, updatedUser } — pointsAwarded is 0 if not eligible
 */
export function awardReportPoints(
    userId: string,
    exifRecordId: number,
    aiLabel: string,
    aiConfidence: number,
    isVerified = false
): { pointsAwarded: number; updatedUser: UserMeta | null } {
    const db = getUsersDb();

    // Idempotency key stored as reason in points_history
    const idempotencyKey = `report:${exifRecordId}`;

    let pointsAwarded = 0;
    let updatedUser: UserMeta | null = null;

    const tx = db.transaction(() => {
        // 1. Guard — ensure user exists
        const user = db
            .prepare("SELECT * FROM users_meta WHERE user_id = ?")
            .get(userId) as UserMeta | undefined;

        if (!user) return; // user_id not found, bail silently

        // 2. Guard — check if points already awarded for this exact report
        const alreadyAwarded = db
            .prepare("SELECT id FROM points_history WHERE user_id = ? AND reason = ?")
            .get(userId, idempotencyKey);

        if (alreadyAwarded) return; // prevent double-award

        // 3. Calculate points
        const pts = calcPoints(aiLabel, aiConfidence);
        pointsAwarded = pts;

        // 4. Always increment reports_count
        db.prepare(
            "UPDATE users_meta SET reports_count = reports_count + 1 WHERE user_id = ?"
        ).run(userId);

        // 5. If eligible for points, update terra_points and add history entry
        if (pts > 0) {
            db.prepare(
                "UPDATE users_meta SET terra_points = terra_points + ? WHERE user_id = ?"
            ).run(pts, userId);

            db.prepare(
                "INSERT INTO points_history (user_id, amount, reason) VALUES (?, ?, ?)"
            ).run(userId, pts, idempotencyKey);
        } else {
            // Still record 0-point submission in history so idempotency works
            db.prepare(
                "INSERT INTO points_history (user_id, amount, reason) VALUES (?, ?, ?)"
            ).run(userId, 0, idempotencyKey);
        }

        // 6. If verified, increment verified_reports counter
        if (isVerified) {
            db.prepare(
                "UPDATE users_meta SET verified_reports = verified_reports + 1 WHERE user_id = ?"
            ).run(userId);
        }

        // 7. Re-fetch updated user — attach computed level
        const raw = db
            .prepare("SELECT * FROM users_meta WHERE user_id = ?")
            .get(userId) as UserMeta;
        updatedUser = withLevel(raw);
    });

    tx();
    return { pointsAwarded, updatedUser };
}
