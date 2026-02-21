/**
 * scripts/migrate-add-image-data.js
 *
 * One-time migration: adds the `image_data BLOB` column to exif_data.
 * Safe to run multiple times — ignores "duplicate column" errors.
 *
 * Usage:  node scripts/migrate-add-image-data.js
 */

const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "lib", "db", "exif.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// ── Add column ────────────────────────────────────────────────────────────────
try {
    db.exec("ALTER TABLE exif_data ADD COLUMN image_data BLOB");
    console.log("✅  Column `image_data BLOB` added to exif_data.");
} catch (e) {
    if (e.message.includes("duplicate column")) {
        console.log("ℹ️   Column `image_data` already exists — nothing to do.");
    } else {
        console.error("❌  Migration failed:", e.message);
        process.exit(1);
    }
}

// ── Verify ────────────────────────────────────────────────────────────────────
const cols = db.prepare("PRAGMA table_info(exif_data)").all();
console.log("\nCurrent columns:");
cols.forEach((c) => console.log(`  ${c.cid.toString().padStart(2)}  ${c.name}  (${c.type || "any"})`));

db.close();
