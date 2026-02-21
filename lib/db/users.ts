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
    return user;
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
