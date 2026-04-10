#!/usr/bin/env node

/**
 * Migration script: SQLite → Supabase
 * 
 * Migrates existing TerraShield data from local SQLite to Supabase.
 * Run this ONCE after setting up Supabase and before deploying to Vercel.
 * 
 * Usage:
 *   node scripts/migrate-sqlite-to-supabase.mjs
 * 
 * Prerequisites:
 *   - .env.local configured with Supabase credentials
 *   - Supabase migration already run (001_initial_schema.sql)
 *   - SQLite database files exist in lib/db/
 */

import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// SQLite paths
const EXIF_DB_PATH = path.join(__dirname, '..', 'lib', 'db', 'exif.db');
const USERS_DB_PATH = path.join(__dirname, '..', 'lib', 'db', 'users.db');

async function migrateUsers() {
    if (!fs.existsSync(USERS_DB_PATH)) {
        console.log('⚠️  No users.db found, skipping user migration');
        return;
    }

    console.log('📊 Migrating users metadata...');
    const db = new Database(USERS_DB_PATH, { readonly: true });

    const users = db.prepare('SELECT * FROM users_meta').all();
    console.log(`   Found ${users.length} users`);

    for (const user of users) {
        const { error } = await supabase
            .from('users_meta')
            .upsert({
                user_id: user.user_id,
                email: user.email,
                name: user.name,
                gender: user.gender,
                phone: user.phone,
                avatar_url: user.avatar_url,
                terra_points: user.terra_points,
                reports_count: user.reports_count,
                verified_reports: user.verified_reports,
                role: user.role,
                created_at: user.created_at,
            }, { onConflict: 'user_id' });

        if (error) {
            console.error(`   ❌ Failed to migrate user ${user.user_id}:`, error.message);
        } else {
            console.log(`   ✅ Migrated user: ${user.email}`);
        }
    }

    // Migrate points history
    const points = db.prepare('SELECT * FROM points_history').all();
    console.log(`   Found ${points.length} point history entries`);

    for (const point of points) {
        const { error } = await supabase
            .from('points_history')
            .insert({
                user_id: point.user_id,
                amount: point.amount,
                reason: point.reason,
                created_at: point.created_at,
            });

        if (error && !error.message.includes('duplicate')) {
            console.error(`   ❌ Failed to migrate point entry:`, error.message);
        }
    }

    db.close();
    console.log('✅ User migration complete\n');
}

async function migrateExifData() {
    if (!fs.existsSync(EXIF_DB_PATH)) {
        console.log('⚠️  No exif.db found, skipping EXIF migration');
        return;
    }

    console.log('📊 Migrating EXIF data...');
    const db = new Database(EXIF_DB_PATH, { readonly: true });

    const records = db.prepare('SELECT * FROM exif_data').all();
    console.log(`   Found ${records.length} EXIF records`);

    let uploaded = 0;
    let skipped = 0;

    for (const record of records) {
        try {
            // Upload image to Supabase Storage if image_data exists
            let storagePath = null;
            if (record.image_data) {
                const timestamp = Date.now();
                const filename = record.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
                storagePath = `${record.user_id}/${timestamp}-${filename}`;

                const { error: uploadError } = await supabase.storage
                    .from('report-images')
                    .upload(storagePath, record.image_data, {
                        contentType: record.mime_type,
                        upsert: false,
                    });

                if (uploadError) {
                    console.error(`   ⚠️  Failed to upload image for record ${record.id}:`, uploadError.message);
                    storagePath = null;
                }
            }

            // Parse JSON fields
            let allTags = {};
            try {
                allTags = JSON.parse(record.all_tags_json || '{}');
            } catch {
                allTags = {};
            }

            let aiTags = null;
            if (record.ai_tags) {
                try {
                    aiTags = JSON.parse(record.ai_tags);
                } catch {
                    aiTags = null;
                }
            }

            let satelliteContext = null;
            if (record.satellite_context_json) {
                try {
                    satelliteContext = JSON.parse(record.satellite_context_json);
                } catch {
                    satelliteContext = null;
                }
            }

            // Insert into Supabase
            const { error } = await supabase
                .from('exif_data')
                .insert({
                    user_id: record.user_id,
                    filename: record.filename,
                    mime_type: record.mime_type,
                    file_size_bytes: record.file_size_bytes,
                    latitude: record.latitude,
                    longitude: record.longitude,
                    altitude: record.altitude,
                    latitude_ref: record.latitude_ref,
                    longitude_ref: record.longitude_ref,
                    maps_url: record.maps_url,
                    make: record.make,
                    model: record.model,
                    software: record.software,
                    date_time: record.date_time,
                    exposure_time: record.exposure_time,
                    f_number: record.f_number,
                    iso: record.iso,
                    focal_length: record.focal_length,
                    flash: record.flash,
                    image_width: record.image_width,
                    image_height: record.image_height,
                    orientation: record.orientation,
                    color_space: record.color_space,
                    image_storage_path: storagePath,
                    ai_label: record.ai_label,
                    ai_confidence: record.ai_confidence,
                    ai_tags: aiTags,
                    ai_summary: record.ai_summary,
                    ai_risk_score: record.ai_risk_score,
                    ai_analysed_at: record.ai_analysed_at,
                    all_tags_json: allTags,
                    satellite_context_json: satelliteContext,
                    district: record.district,
                    state: record.state,
                    country: record.country,
                    created_at: record.created_at,
                    updated_at: record.updated_at,
                });

            if (error) {
                console.error(`   ❌ Failed to migrate record ${record.id}:`, error.message);
                skipped++;
            } else {
                uploaded++;
                if (uploaded % 10 === 0) {
                    console.log(`   📤 Migrated ${uploaded}/${records.length} records...`);
                }
            }
        } catch (err) {
            console.error(`   ❌ Error migrating record ${record.id}:`, err.message);
            skipped++;
        }
    }

    db.close();
    console.log(`✅ EXIF migration complete: ${uploaded} uploaded, ${skipped} skipped\n`);
}

async function main() {
    console.log('🚀 TerraShield SQLite → Supabase Migration\n');
    console.log('⚠️  WARNING: This will upload all data to Supabase.');
    console.log('   Make sure you have run the Supabase migration first!\n');

    try {
        await migrateUsers();
        await migrateExifData();

        console.log('✅ Migration complete!');
        console.log('\n📝 Next steps:');
        console.log('   1. Verify data in Supabase dashboard');
        console.log('   2. Test the application locally');
        console.log('   3. Deploy to Vercel');
        console.log('   4. (Optional) Backup and delete SQLite files\n');
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

main();
