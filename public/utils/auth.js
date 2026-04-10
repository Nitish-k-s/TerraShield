/**
 * utils/auth.js
 * Local JWT auth helper for TerraShield frontend SPA.
 * Replaces Supabase auth — uses /api/auth/login and /api/auth/signup
 */

const TOKEN_KEY = 'terrashield_token';
const USER_KEY  = 'terrashield_user';

// ─── Token storage ────────────────────────────────────────────────────────────

export function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function getSessionToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

export function getSession() {
    const token = getSessionToken();
    const user = getUser();
    if (!token || !user) return null;
    return { access_token: token, user };
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

export async function signIn(email, password) {
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error || 'Login failed' } };
        saveSession(data.token, data.user);
        _notifyListeners(data.user);
        return { error: null };
    } catch (e) {
        return { error: { message: e.message } };
    }
}

export async function signUp(email, password, name = '', role = '') {
    try {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, role }),
        });
        const data = await res.json();
        if (!res.ok) return { error: { message: data.error || 'Signup failed' } };
        saveSession(data.token, data.user);
        _notifyListeners(data.user);
        return { error: null };
    } catch (e) {
        return { error: { message: e.message } };
    }
}

export function signOut() {
    clearSession();
    _notifyListeners(null);
}

export function getUserDisplayName(user) {
    if (!user) return null;
    return user.name || user.user_metadata?.full_name || null;
}

// ─── Auth state listeners ─────────────────────────────────────────────────────

const _listeners = new Set();

export function onAuthChange(callback) {
    _listeners.add(callback);
    // Fire immediately with current state
    callback(getUser());
    return () => _listeners.delete(callback);
}

function _notifyListeners(user) {
    _listeners.forEach(cb => cb(user));
}

// ─── Compat shim (for code that calls getSupabase()) ─────────────────────────
export function getSupabase() {
    console.warn('[auth] getSupabase() is deprecated — use signIn/signOut/getUser directly');
    return null;
}
