const Database = require("better-sqlite3");
const db = new Database("./lib/db/exif.db");

// Show all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("=== Tables ===");
console.log(JSON.stringify(tables, null, 2));

// Show saved EXIF rows
try {
    const rows = db.prepare(
        "SELECT id, filename, mime_type, latitude, longitude, make, model, created_at FROM exif_data ORDER BY created_at DESC"
    ).all();
    console.log("\n=== exif_data rows:", rows.length, "===");
    console.log(JSON.stringify(rows, null, 2));
} catch (e) {
    console.log("Error querying exif_data:", e.message);
}

db.close();
