const fs = require('fs');
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'lib', 'db', 'exif.db');

try {
    const db = new Database(DB_PATH, { fileMustExist: true });
    console.log("Connected to DB");

    const records = db.prepare("SELECT * FROM exif_data ORDER BY id DESC LIMIT 5").all();

    if (records.length === 0) {
        console.log("No records found in exif_data table.");
    } else {
        records.forEach(r => {
            console.log(`\n--- Record ID: ${r.id} ---`);
            console.log(`User ID: ${r.user_id}`);
            console.log(`Filename: ${r.filename}`);
            console.log(`GPS: ${r.latitude}, ${r.longitude}`);
            console.log(`Created At: ${r.created_at}`);
        });
    }
} catch (e) {
    console.log("Error querying DB:", e.message);
}
