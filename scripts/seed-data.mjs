/**
 * scripts/seed-data.mjs
 * Seeds users.db and exif.db with realistic demo data
 */

import Database from 'better-sqlite3';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(__dirname, '..', 'lib', 'db');

const usersDb = new Database(path.join(DB_DIR, 'users.db'));
const exifDb = new Database(path.join(DB_DIR, 'exif.db'));

usersDb.pragma('journal_mode = WAL');
exifDb.pragma('journal_mode = WAL');

// Ensure password_hash column exists
try { usersDb.exec("ALTER TABLE users_meta ADD COLUMN password_hash TEXT"); } catch {}
try { usersDb.exec("ALTER TABLE users_meta ADD COLUMN role TEXT DEFAULT 'user'"); } catch {}

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

// ─── Users ────────────────────────────────────────────────────────────────────

const users = [
    {
        user_id: crypto.randomUUID(),
        email: 'dr.priya@iiserbhopal.ac.in',
        name: 'Dr. Priya Sharma',
        role: 'researcher',
        gender: 'Female',
        phone: '+91-9876543210',
        terra_points: 1240,
        reports_count: 38,
        verified_reports: 29,
        password: 'researcher123',
    },
    {
        user_id: crypto.randomUUID(),
        email: 'moef.inspector@gov.in',
        name: 'Rajesh Kumar IFS',
        role: 'government',
        gender: 'Male',
        phone: '+91-9123456789',
        terra_points: 870,
        reports_count: 22,
        verified_reports: 18,
        password: 'govagency123',
    },
    {
        user_id: crypto.randomUUID(),
        email: 'field@wwfindia.org',
        name: 'Ananya Menon',
        role: 'ngo',
        gender: 'Female',
        phone: '+91-9988776655',
        terra_points: 2100,
        reports_count: 61,
        verified_reports: 54,
        password: 'ngo12345',
    },
    {
        user_id: crypto.randomUUID(),
        email: 'citizen.arjun@gmail.com',
        name: 'Arjun Patel',
        role: 'user',
        gender: 'Male',
        phone: '+91-9001122334',
        terra_points: 310,
        reports_count: 11,
        verified_reports: 7,
        password: 'citizen123',
    },
];

// Insert users
const insertUser = usersDb.prepare(`
    INSERT OR IGNORE INTO users_meta 
    (user_id, email, name, role, gender, phone, terra_points, reports_count, verified_reports, password_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertPoints = usersDb.prepare(`
    INSERT INTO points_history (user_id, amount, reason, created_at) VALUES (?, ?, ?, ?)
`);

for (const u of users) {
    const existing = usersDb.prepare("SELECT user_id FROM users_meta WHERE email = ?").get(u.email);
    if (existing) { console.log(`⏭  Skipping existing user: ${u.email}`); continue; }

    insertUser.run(u.user_id, u.email, u.name, u.role, u.gender, u.phone, u.terra_points, u.reports_count, u.verified_reports, hashPassword(u.password));

    // Welcome points
    insertPoints.run(u.user_id, 50, 'Welcome to TerraShield', new Date(Date.now() - 90 * 86400000).toISOString());

    // Simulate report points history
    const reasons = [
        'Invasive species report verified',
        'High-confidence detection bonus',
        'Outbreak cluster contribution',
        'Weekly active reporter bonus',
        'First report of species in district',
    ];
    let remaining = u.terra_points - 50;
    let daysAgo = 85;
    while (remaining > 0) {
        const amt = Math.min(remaining, [10, 20, 30][Math.floor(Math.random() * 3)]);
        const reason = reasons[Math.floor(Math.random() * reasons.length)];
        insertPoints.run(u.user_id, amt, reason, new Date(Date.now() - daysAgo * 86400000).toISOString());
        remaining -= amt;
        daysAgo -= Math.floor(Math.random() * 3) + 1;
        if (daysAgo < 0) break;
    }

    console.log(`✅ Created user: ${u.name} (${u.role}) — ${u.email} / ${u.password}`);
}

// ─── EXIF / Report Data ───────────────────────────────────────────────────────

// Real invasive species sightings across India with realistic GPS coords
const reports = [
    // Lantana camara — Western Ghats
    { lat: 11.6234, lon: 76.5932, species: 'Lantana camara', label: 'invasive-plant', confidence: 0.94, risk: 8.2, district: 'Nilgiris', state: 'Tamil Nadu', country: 'India', summary: 'Dense Lantana camara infestation detected along forest edge. Significant understory displacement observed. High spread risk due to proximity to Mudumalai Tiger Reserve buffer zone.', tags: ['Lantana camara', 'shrubland', 'high-spread'], daysAgo: 3 },
    // Water Hyacinth — Kerala backwaters
    { lat: 9.4981, lon: 76.3388, species: 'Eichhornia crassipes', label: 'invasive-plant', confidence: 0.97, risk: 9.1, district: 'Alappuzha', state: 'Kerala', country: 'India', summary: 'Extensive Water Hyacinth mat covering approximately 60% of canal surface. Blocking boat traffic and depleting dissolved oxygen. Critical threat to native aquatic biodiversity.', tags: ['Eichhornia crassipes', 'aquatic', 'critical-spread'], daysAgo: 1 },
    // Mikania micrantha — Assam
    { lat: 26.1445, lon: 91.7362, species: 'Mikania micrantha', label: 'invasive-plant', confidence: 0.91, risk: 7.8, district: 'Kamrup', state: 'Assam', country: 'India', summary: 'Mile-a-minute weed (Mikania micrantha) smothering native vegetation in tea garden periphery. Rapid canopy coverage threatening adjacent Kaziranga buffer forest.', tags: ['Mikania micrantha', 'forest-edge', 'high-spread'], daysAgo: 5 },
    // Prosopis juliflora — Rajasthan
    { lat: 26.9124, lon: 70.9123, species: 'Prosopis juliflora', label: 'invasive-plant', confidence: 0.88, risk: 6.5, district: 'Jaisalmer', state: 'Rajasthan', country: 'India', summary: 'Prosopis juliflora (Vilayati Babool) forming dense monoculture stands displacing native desert scrub. Thorny thickets reducing grazing land and blocking wildlife corridors.', tags: ['Prosopis juliflora', 'arid-scrubland', 'moderate-spread'], daysAgo: 7 },
    // African Catfish — Andhra Pradesh
    { lat: 16.3067, lon: 80.4365, species: 'Clarias gariepinus', label: 'invasive-animal', confidence: 0.86, risk: 7.4, district: 'Krishna', state: 'Andhra Pradesh', country: 'India', summary: 'African Catfish detected in Krishna river tributary. Predatory species known to devastate native fish populations. Likely escaped from aquaculture facility upstream.', tags: ['Clarias gariepinus', 'freshwater', 'high-spread'], daysAgo: 2 },
    // Parthenium — Maharashtra
    { lat: 18.5204, lon: 73.8567, species: 'Parthenium hysterophorus', label: 'invasive-plant', confidence: 0.93, risk: 7.9, district: 'Pune', state: 'Maharashtra', country: 'India', summary: 'Congress grass (Parthenium hysterophorus) dense infestation along highway corridor. Severe allergen risk to local population. Displacing native grassland species rapidly.', tags: ['Parthenium hysterophorus', 'grassland', 'high-spread'], daysAgo: 4 },
    // Chromolaena odorata — Odisha
    { lat: 20.2961, lon: 85.8245, species: 'Chromolaena odorata', label: 'invasive-plant', confidence: 0.89, risk: 7.1, district: 'Khordha', state: 'Odisha', country: 'India', summary: 'Siam weed (Chromolaena odorata) spreading aggressively in Chilika Lake buffer zone. Fire-prone biomass accumulation poses additional risk to adjacent habitats.', tags: ['Chromolaena odorata', 'wetland-edge', 'high-spread'], daysAgo: 6 },
    // Red-eared slider — Karnataka
    { lat: 12.9716, lon: 77.5946, species: 'Trachemys scripta elegans', label: 'invasive-animal', confidence: 0.82, risk: 5.8, district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', summary: 'Red-eared slider turtles observed in Ulsoor Lake. Released pets establishing feral population. Competing with native Indian softshell turtles for basking sites and food.', tags: ['Trachemys scripta', 'urban-wetland', 'moderate-spread'], daysAgo: 9 },
    // Salvinia molesta — West Bengal
    { lat: 22.5726, lon: 88.3639, species: 'Salvinia molesta', label: 'invasive-plant', confidence: 0.95, risk: 8.7, district: 'Kolkata', state: 'West Bengal', country: 'India', summary: 'Giant salvinia forming dense mats on East Kolkata Wetlands. UNESCO Ramsar site under threat. Rapid doubling time of 2-3 days observed. Immediate intervention required.', tags: ['Salvinia molesta', 'wetland', 'critical-spread'], daysAgo: 2 },
    // Lantana cluster 2 — Nilgiris (for cluster detection)
    { lat: 11.6301, lon: 76.5988, species: 'Lantana camara', label: 'invasive-plant', confidence: 0.92, risk: 8.0, district: 'Nilgiris', state: 'Tamil Nadu', country: 'India', summary: 'Secondary Lantana camara stand 700m from primary sighting. Cluster formation confirmed. Seed dispersal by birds accelerating spread into core forest area.', tags: ['Lantana camara', 'shrubland', 'high-spread'], daysAgo: 4 },
    // Lantana cluster 3 — Nilgiris
    { lat: 11.6189, lon: 76.5901, species: 'Lantana camara', label: 'invasive-plant', confidence: 0.90, risk: 7.9, district: 'Nilgiris', state: 'Tamil Nadu', country: 'India', summary: 'Third Lantana camara occurrence within 5km radius. Outbreak cluster confirmed. Coordinated removal effort recommended before monsoon dispersal season.', tags: ['Lantana camara', 'shrubland', 'high-spread'], daysAgo: 6 },
    // Water Hyacinth cluster 2 — Kerala
    { lat: 9.5021, lon: 76.3412, species: 'Eichhornia crassipes', label: 'invasive-plant', confidence: 0.96, risk: 9.0, district: 'Alappuzha', state: 'Kerala', country: 'India', summary: 'Second Water Hyacinth mat 400m upstream. Connected infestation spanning 2.3km of canal network. Mechanical harvesting urgently needed.', tags: ['Eichhornia crassipes', 'aquatic', 'critical-spread'], daysAgo: 2 },
    // Water Hyacinth cluster 3 — Kerala
    { lat: 9.4945, lon: 76.3355, species: 'Eichhornia crassipes', label: 'invasive-plant', confidence: 0.94, risk: 8.8, district: 'Alappuzha', state: 'Kerala', country: 'India', summary: 'Third Water Hyacinth occurrence in Kuttanad backwater system. Monsoon flooding risk will accelerate spread to adjacent paddy fields.', tags: ['Eichhornia crassipes', 'aquatic', 'critical-spread'], daysAgo: 3 },
    // Deforestation — Jharkhand
    { lat: 23.6102, lon: 85.2799, species: 'Sal forest clearance', label: 'deforestation', confidence: 0.91, risk: 8.5, district: 'Ranchi', state: 'Jharkhand', country: 'India', summary: 'Significant Sal forest clearance detected via satellite anomaly. Approximately 12 hectares cleared in past 30 days. Illegal encroachment suspected near Palamau Tiger Reserve.', tags: ['deforestation', 'Sal forest', 'critical'], daysAgo: 8 },
    // Normal terrain — Himachal
    { lat: 32.2190, lon: 77.1890, species: 'Alpine meadow', label: 'normal-terrain', confidence: 0.88, risk: 1.2, district: 'Kullu', state: 'Himachal Pradesh', country: 'India', summary: 'Alpine meadow in healthy condition. Native Himalayan flora intact. No invasive species detected. NDVI values within normal seasonal range.', tags: ['alpine-meadow', 'healthy', 'no-threat'], daysAgo: 12 },
    // Flood risk — Bihar
    { lat: 25.5941, lon: 85.1376, species: 'Flood-prone zone', label: 'flood-risk', confidence: 0.87, risk: 6.8, district: 'Patna', state: 'Bihar', country: 'India', summary: 'Vegetation stress patterns consistent with waterlogging detected. Ganges floodplain showing anomalous NDVI depression. Invasive reed species may exploit post-flood disturbance.', tags: ['flood-risk', 'floodplain', 'moderate'], daysAgo: 5 },
];

// Get all user IDs for distributing reports
const allUsers = usersDb.prepare("SELECT user_id FROM users_meta").all();
const userIds = allUsers.map(u => u.user_id);

const insertReport = exifDb.prepare(`
    INSERT INTO exif_data (
        user_id, filename, mime_type, file_size_bytes,
        latitude, longitude, altitude,
        maps_url, district, state, country,
        ai_label, ai_confidence, ai_tags, ai_summary, ai_risk_score, ai_analysed_at,
        all_tags_json, image_storage_path,
        created_at, updated_at
    ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?
    )
`);

let inserted = 0;
for (let i = 0; i < reports.length; i++) {
    const r = reports[i];
    const userId = userIds[i % userIds.length];
    const ts = new Date(Date.now() - r.daysAgo * 86400000).toISOString();
    const mapsUrl = `https://www.google.com/maps?q=${r.lat},${r.lon}`;
    const filename = `report_${r.species.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.jpg`;

    insertReport.run(
        userId, filename, 'image/jpeg', Math.floor(Math.random() * 3000000) + 500000,
        r.lat, r.lon, Math.floor(Math.random() * 800) + 50,
        mapsUrl, r.district, r.state, r.country,
        r.label, r.confidence, JSON.stringify(r.tags), r.summary, r.risk, ts,
        JSON.stringify({ Make: 'Samsung', Model: 'Galaxy S23', GPS: { lat: r.lat, lon: r.lon } }), null,
        ts, ts
    );
    inserted++;
}

console.log(`\n✅ Seeded ${inserted} ecological reports`);
console.log('\n📋 Login credentials:');
for (const u of users) {
    console.log(`   ${u.role.padEnd(12)} | ${u.email.padEnd(35)} | ${u.password}`);
}
console.log('\n   Also: nitish@gmail.com (existing account)');
