// Navbar Component — auth-aware
import { getUser, signOut, onAuthChange, getSessionToken, getUserDisplayName } from '../utils/auth.js';

/** Renders the navbar shell. Auth state is applied dynamically by initNavbarAuth(). */
export function renderNavbar(activePage = '') {
  return `
  <header class="navbar" id="main-navbar">
    <div class="navbar-inner">
      <a href="#/" class="navbar-logo">
        <svg class="ts-logo" width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shield-grad-nav" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1dacc9"/>
              <stop offset="100%" stop-color="#2d5a4c"/>
            </linearGradient>
          </defs>
          <path class="ts-shield" d="M50 8 L88 28 L88 52 C88 74 72 90 50 96 C28 90 12 74 12 52 L12 28 Z" fill="url(#shield-grad-nav)" opacity="0.9">
            <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite"/>
          </path>
          <path class="ts-leaf" d="M50 30 C50 30 36 44 36 56 C36 64 42 70 50 70 C58 70 64 64 64 56 C64 44 50 30 50 30Z" fill="#fff" opacity="0.9"/>
          <line class="ts-leaf-vein" x1="50" y1="38" x2="50" y2="66" stroke="#1dacc9" stroke-width="1.5" opacity="0.5"/>
          <line x1="50" y1="50" x2="42" y2="58" stroke="#1dacc9" stroke-width="1" opacity="0.3"/>
          <line x1="50" y1="46" x2="57" y2="54" stroke="#1dacc9" stroke-width="1" opacity="0.3"/>
        </svg>
        <span class="navbar-logo-text">TerraShield</span>
      </a>
      <nav class="navbar-links">
        <a href="#/" class="${activePage === 'home' ? 'active' : ''}">Home</a>
        <a href="#/about" class="${activePage === 'about' ? 'active' : ''}">Platform</a>
        <a href="#/alerts" class="${activePage === 'alerts' ? 'active' : ''}">Alerts</a>
        <a href="#/report" class="${activePage === 'report' ? 'active' : ''}">Report</a>
        <a href="#/statistics" class="${activePage === 'statistics' ? 'active' : ''}">Statistics</a>
      </nav>
      <div class="navbar-actions">
        <!-- Auth slot — populated dynamically by initNavbarAuth() -->
        <div id="navbar-auth-slot" style="display:flex;align-items:center;gap:0.75rem">
          <span style="width:5rem;height:1.75rem;background:var(--color-slate-100);border-radius:var(--radius-full);animation:pulse-ring 1.5s ease-in-out infinite;opacity:0.5"></span>
        </div>
        <div class="hamburger" id="hamburger-btn" onclick="document.getElementById('hamburger-btn').classList.toggle('open'); document.getElementById('mobile-nav').classList.toggle('open');">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
    <nav class="mobile-menu" id="mobile-nav">
      <a href="#/" onclick="document.getElementById('mobile-nav').classList.remove('open'); document.getElementById('hamburger-btn').classList.remove('open');">Home</a>
      <a href="#/about" onclick="document.getElementById('mobile-nav').classList.remove('open'); document.getElementById('hamburger-btn').classList.remove('open');">Platform</a>
      <a href="#/alerts" onclick="document.getElementById('mobile-nav').classList.remove('open'); document.getElementById('hamburger-btn').classList.remove('open');">Alerts</a>
      <a href="#/report" onclick="document.getElementById('mobile-nav').classList.remove('open'); document.getElementById('hamburger-btn').classList.remove('open');">Report</a>
      <a href="#/statistics" onclick="document.getElementById('mobile-nav').classList.remove('open'); document.getElementById('hamburger-btn').classList.remove('open');">Statistics</a>
      <div id="mobile-auth-slot"></div>
    </nav>
  </header>`;
}

/**
 * Fetches the saved profile name from /api/user-profile.
 * Returns null on error (navbar will fall back to user_metadata name or email).
 */
async function fetchProfileName(token) {
  try {
    const res = await fetch('/api/user-profile', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.profile?.name || null;
  } catch (_) {
    return null;
  }
}

/**
 * Call once after renderNavbar() is in the DOM.
 * Resolves all name sources in parallel, then renders the navbar EXACTLY ONCE.
 * No intermediate renders → no flicker.
 */
export async function initNavbarAuth() {
  // Avoid registering duplicate auth listeners on the same page
  if (window._tsNavAuthInit) return;
  window._tsNavAuthInit = true;

  const _resolve = async (u) => {
    if (!u) { _applyAuthState(null, null); return; }

    // Fetch both sources concurrently — single render after both settle
    const token = await getSessionToken();
    const [dbName] = await Promise.all([
      fetchProfileName(token),
    ]);

    // Priority: DB name (latest saved) → Supabase user_metadata → null
    const metaName = getUserDisplayName(u);
    const resolvedName = dbName || metaName || null;

    // ONE render call — navbar never shows email
    _applyAuthState(u, resolvedName);
  };

  const user = await getUser();
  await _resolve(user);

  // Keep in sync when user signs in/out from another tab
  onAuthChange(async (u) => {
    window._tsNavAuthInit = false; // allow re-registration on next navigation
    await _resolve(u);
  });
}

function _applyAuthState(user, displayName = null) {
  const slot = document.getElementById('navbar-auth-slot');
  const mobileSlot = document.getElementById('mobile-auth-slot');
  if (!slot) return;

  if (user) {
    // Display name priority: DB name → Supabase metadata name → email local-part
    const email = user.email ?? '';
    const label = displayName || email.split('@')[0] || 'Account';
    const short = label.length > 18 ? label.slice(0, 16) + '\u2026' : label;
    const initial = label.charAt(0).toUpperCase();

    slot.innerHTML = `
      <a href="#/profile" title="View Profile" style="display:flex;align-items:center;gap:0.5rem;text-decoration:none;padding:0.25rem 0.75rem 0.25rem 0.25rem;border-radius:100px;background:var(--color-primary-10);transition:background 0.2s">
        <div style="width:2rem;height:2rem;border-radius:50%;background:var(--color-primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.875rem">
          ${initial}
        </div>
        <span style="font-size:0.875rem;font-weight:var(--fw-bold);color:var(--color-slate-800);max-width:6rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${short}</span>
      </a>
      <button id="navbar-signout" class="btn btn-sm"
        style="border:1px solid var(--color-slate-300);color:var(--color-slate-600);background:transparent;font-size:0.75rem;padding:0.25rem 0.5rem">
        Sign Out
      </button>`;

    if (mobileSlot) mobileSlot.innerHTML = `
      <span style="display:block;padding:0.75rem 1.25rem;font-size:0.8rem;color:var(--color-slate-500)">${label}</span>
      <button id="mobile-signout" style="display:block;width:100%;text-align:left;padding:0.75rem 1.25rem;font-size:0.9rem;color:var(--color-red);background:none;border:none;cursor:pointer;font-family:inherit">
        Sign Out
      </button>`;

    // Attach sign-out handlers (only once, avoid duplicate listeners)
    const attachSignOut = (id) => {
      const btn = document.getElementById(id);
      if (!btn || btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', async () => {
        await signOut();
        window.location.hash = '#/login';
      });
    };
    attachSignOut('navbar-signout');
    attachSignOut('mobile-signout');

  } else {
    // Not logged in — show Sign In button
    slot.innerHTML = `<a href="#/login" class="btn btn-primary btn-sm">Sign In</a>`;
    if (mobileSlot) mobileSlot.innerHTML = `
      <a href="#/login" onclick="document.getElementById('mobile-nav').classList.remove('open'); document.getElementById('hamburger-btn').classList.remove('open');">Sign In</a>`;
  }
}
