import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'lib', 'db', 'users.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// ── Show current state ───────────────────────────────────────────────────────
console.log('\n── BEFORE ──────────────────────────────────────────────────');
const usersBefore = db.prepare('SELECT user_id, terra_points, reports_count FROM users_meta').all();
console.log('users_meta:', usersBefore);
const historyBefore = db.prepare("SELECT id, reason, amount, created_at FROM points_history ORDER BY created_at ASC").all();
console.log('points_history:', historyBefore);

// ── Reset ────────────────────────────────────────────────────────────────────
const tx = db.transaction(() => {
    // Keep only 'Welcome to TerraShield' and 'report:1'
    const keepReasons = ['Welcome to TerraShield', 'report:1'];
    const placeholders = keepReasons.map(() => '?').join(', ');
    const deleted = db.prepare(
        `DELETE FROM points_history WHERE reason NOT IN (${placeholders})`
    ).run(...keepReasons);
    console.log(`\nDeleted ${deleted.changes} history rows`);

    // Recalculate total points from remaining history rows (per user)
    const users = db.prepare('SELECT user_id FROM users_meta').all();
    for (const { user_id } of users) {
        const { total } = db.prepare(
            'SELECT COALESCE(SUM(amount), 0) AS total FROM points_history WHERE user_id = ?'
        ).get(user_id);
        // Count remaining report entries (not the welcome bonus)
        const { reportCount } = db.prepare(
            "SELECT COUNT(*) AS reportCount FROM points_history WHERE user_id = ? AND reason LIKE 'report:%'"
        ).get(user_id);
        db.prepare(
            'UPDATE users_meta SET terra_points = ?, reports_count = ? WHERE user_id = ?'
        ).run(total, reportCount, user_id);
        console.log(`  User ${user_id.slice(0, 8)}… → terra_points=${total}, reports_count=${reportCount}`);
    }
});

tx();

// ── Show result ──────────────────────────────────────────────────────────────
console.log('\n── AFTER ───────────────────────────────────────────────────');
const usersAfter = db.prepare('SELECT user_id, terra_points, reports_count FROM users_meta').all();
console.log('users_meta:', usersAfter);
const historyAfter = db.prepare("SELECT id, reason, amount FROM points_history ORDER BY created_at ASC").all();
console.log('points_history:', historyAfter);

db.close();
console.log('\n✓ Done — points reset, report:1 kept.');
