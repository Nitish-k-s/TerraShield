// Navbar Component — auth-aware
import { getUser, signOut, onAuthChange } from '../utils/auth.js';

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
      <div id="mobile-auth-slot"></div>
    </nav>
  </header>`;
}

/**
 * Call once after renderNavbar() is in the DOM.
 * Reads the Supabase session and renders Sign In OR user email + Sign Out.
 * Also subscribes to auth changes so the navbar updates live.
 */
export async function initNavbarAuth() {
  const user = await getUser();
  _applyAuthState(user);

  // Keep in sync when user signs in/out from another tab or in-page
  onAuthChange((u) => _applyAuthState(u));
}

function _applyAuthState(user) {
  const slot = document.getElementById('navbar-auth-slot');
  const mobileSlot = document.getElementById('mobile-auth-slot');
  if (!slot) return;

  if (user) {
    // Logged in — show email chip + Sign Out
    const email = user.email ?? 'Account';
    const short = email.length > 18 ? email.slice(0, 16) + '…' : email;

    slot.innerHTML = `
      <a href="#/profile" title="View Profile" style="display:flex;align-items:center;gap:0.5rem;text-decoration:none;padding:0.25rem 0.75rem 0.25rem 0.25rem;border-radius:100px;background:var(--color-primary-10);transition:background 0.2s">
        <div style="width:2rem;height:2rem;border-radius:50%;background:var(--color-primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.875rem">
          ${email.charAt(0).toUpperCase()}
        </div>
        <span style="font-size:0.875rem;font-weight:var(--fw-bold);color:var(--color-slate-800);max-width:6rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${short}</span>
      </a>
      <button id="navbar-signout" class="btn btn-sm"
        style="border:1px solid var(--color-slate-300);color:var(--color-slate-600);background:transparent;font-size:0.75rem;padding:0.25rem 0.5rem">
        Sign Out
      </button>`;

    if (mobileSlot) mobileSlot.innerHTML = `
      <span style="display:block;padding:0.75rem 1.25rem;font-size:0.8rem;color:var(--color-slate-500)">${email}</span>
      <button id="mobile-signout" style="display:block;width:100%;text-align:left;padding:0.75rem 1.25rem;font-size:0.9rem;color:var(--color-red);background:none;border:none;cursor:pointer;font-family:inherit">
        Sign Out
      </button>`;

    // Attach sign-out handlers
    const attachSignOut = (id) => {
      const btn = document.getElementById(id);
      if (!btn) return;
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
