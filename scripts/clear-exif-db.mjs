import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'lib', 'db', 'exif.db');

const db = new Database(dbPath);

// List tables before clearing
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables found:', tables.map(t => t.name));

// Delete all rows from each table
for (const { name } of tables) {
    const count = db.prepare(`SELECT COUNT(*) as n FROM "${name}"`).get().n;
    db.prepare(`DELETE FROM "${name}"`).run();
    console.log(`✓ Cleared ${count} rows from "${name}"`);
}

// Reset auto-increment counters
db.prepare("DELETE FROM sqlite_sequence").run();
console.log('✓ Reset auto-increment counters');

db.close();
console.log('\nDone — exif.db is clean and ready for fresh entries.');
