/**
 * utils/auth.js
 *
 * Supabase auth helper for the TerraShield frontend SPA.
 * Uses the Supabase JS v2 CDN build (loaded in index.html via importmap).
 *
 * Provides:
 *  - getSupabase()        → singleton Supabase client
 *  - getSession()         → current session or null
 *  - getUser()            → current user or null
 *  - signIn(email, pass)  → { error }
 *  - signUp(email, pass)  → { error }
 *  - signOut()            → void
 *  - onAuthChange(cb)     → unsubscribe fn
 */

const SUPABASE_URL = 'https://utnlgwhofcssmlcmuvlw.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bmxnd2hvZmNzc21sY211dmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NDE5NjQsImV4cCI6MjA4NzIxNzk2NH0.LSDJMO_Tq-l4pWRNE-07oANrSYEwecY1yW8DiXWenvI';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

let _client = null;

export function getSupabase() {
    if (!_client) {
        _client = createClient(SUPABASE_URL, SUPABASE_ANON);
    }
    return _client;
}

export async function getSession() {
    const { data } = await getSupabase().auth.getSession();
    return data?.session ?? null;
}

export async function getUser() {
    const { data } = await getSupabase().auth.getUser();
    return data?.user ?? null;
}

export async function signIn(email, password) {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    return { error };
}

export async function signUp(email, password) {
    const { error } = await getSupabase().auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    return { error };
}

export async function signOut() {
    await getSupabase().auth.signOut();
}

/** Subscribe to auth state changes. Returns the unsubscribe function. */
export function onAuthChange(callback) {
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
}
