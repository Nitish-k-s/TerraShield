// Navbar Component — auth-aware
import { getUser, signOut, onAuthChange, getSessionToken, getUserDisplayName } from '../utils/auth.js';

/** Renders the navbar shell. Auth state is applied dynamically by initNavbarAuth(). */
export function renderNavbar(activePage = '') {
  return `
  <header class="navbar" id="main-navbar">
    <div class="navbar-inner">
      <a href="#/" class="navbar-logo">
        <img src="/terrashield-logo.svg" width="40" height="40" alt="TerraShield" style="object-fit:contain"/>
        <span class="navbar-logo-text">TerraShield</span>
      </a>
      <nav class="navbar-links">
        <a href="#/" class="${activePage === 'home' ? 'active' : ''}">Home</a>
        <a href="#/about" class="${activePage === 'about' ? 'active' : ''}">Platform</a>
        <a href="#/alerts" class="${activePage === 'alerts' ? 'active' : ''}">Alerts</a>
        <a href="#/report" class="${activePage === 'report' ? 'active' : ''}">Report</a>
        <a href="#/statistics" class="${activePage === 'statistics' ? 'active' : ''}">Statistics</a>
        <a href="#/memory" class="${activePage === 'memory' ? 'active' : ''}" style="display:flex;align-items:center;gap:4px">🧠 Memory</a>
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
      <a href="#/memory" onclick="document.getElementById('mobile-nav').classList.remove('open'); document.getElementById('hamburger-btn').classList.remove('open');">🧠 Memory</a>
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
