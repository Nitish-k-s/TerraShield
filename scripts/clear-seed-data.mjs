/**
 * scripts/clear-seed-data.mjs
 * Removes ALL seeded/fake data from Supabase tables.
 * Uses service_role key to bypass RLS.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

console.log(`🔗 Connecting to: ${url}`);
console.log(`🔑 Using key ending in: ...${key.slice(-20)}\n`);

const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function clearTable(tableName) {
    // First, count rows
    const { count, error: countErr } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
    
    if (countErr) {
        console.log(`⚠️  ${tableName}: Cannot read (${countErr.message})`);
    } else {
        console.log(`📊 ${tableName}: ${count} rows found`);
    }

    // Delete all rows - use neq on a non-nullable field to match everything
    const { error: delErr, count: delCount } = await supabase
        .from(tableName)
        .delete({ count: 'exact' })
        .neq('id', -99999); // matches everything since no row has this id
    
    if (delErr) {
        console.log(`❌ ${tableName}: Delete failed — ${delErr.message}`);
        console.log(`   Hint: ${delErr.hint || 'none'}`);
        console.log(`   Details: ${delErr.details || 'none'}`);
        return false;
    } else {
        console.log(`✅ ${tableName}: Deleted ${delCount ?? 'all'} rows`);
        return true;
    }
}

async function clearAllData() {
    console.log('🧹 Clearing all seed/fake data from Supabase...\n');

    // Delete in order (respect foreign keys)
    await clearTable('agent_memories');
    console.log('');
    await clearTable('points_history');
    console.log('');
    await clearTable('exif_data');
    console.log('');

    // Reset users_meta counters
    const { data: users, error: usrErr } = await supabase
        .from('users_meta')
        .select('user_id, email');
    
    if (usrErr) {
        console.log(`⚠️  users_meta: Cannot read (${usrErr.message})`);
    } else if (users && users.length > 0) {
        console.log(`📊 users_meta: ${users.length} users found`);
        for (const u of users) {
            const { error: updErr } = await supabase
                .from('users_meta')
                .update({
                    terra_points: 50,
                    reports_count: 0,
                    verified_reports: 0,
                })
                .eq('user_id', u.user_id);
            if (updErr) {
                console.log(`  ❌ Failed to reset ${u.email}: ${updErr.message}`);
            }
        }
        console.log(`✅ users_meta: Reset counters for ${users.length} users`);
    } else {
        console.log('📊 users_meta: No users found');
    }

    // Storage cleanup
    console.log('');
    try {
        const { data: folders } = await supabase.storage
            .from('report-images')
            .list('', { limit: 1000 });
        
        if (folders && folders.length > 0) {
            let allPaths = [];
            for (const item of folders) {
                if (item.metadata) {
                    allPaths.push(item.name);
                } else {
                    const { data: subFiles } = await supabase.storage
                        .from('report-images')
                        .list(item.name, { limit: 1000 });
                    if (subFiles) {
                        allPaths.push(...subFiles.map(f => `${item.name}/${f.name}`));
                    }
                }
            }
            if (allPaths.length > 0) {
                const { error: storageErr } = await supabase.storage
                    .from('report-images')
                    .remove(allPaths);
                console.log(storageErr
                    ? `❌ Storage: ${storageErr.message}`
                    : `✅ Storage: Cleared ${allPaths.length} files`
                );
            } else {
                console.log('✅ Storage: Already empty');
            }
        } else {
            console.log('✅ Storage: Already empty');
        }
    } catch (e) {
        console.warn('⚠️  Storage cleanup skipped:', e.message);
    }

    console.log('\n🎉 Done! Your database is clean. Upload fresh reports to get started.');
}

clearAllData().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
