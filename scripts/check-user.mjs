import Database from 'better-sqlite3';
const db = new Database('lib/db/users.db');
const rows = db.prepare("SELECT user_id, email, name, role, created_at FROM users_meta WHERE name LIKE ? OR email LIKE ?").all('%nitish%', '%nitish%');
console.log(rows.length === 0 ? 'No account found for nitish' : JSON.stringify(rows, null, 2));
