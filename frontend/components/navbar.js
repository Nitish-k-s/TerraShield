// Navbar Component
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
        <a href="#/login" class="btn btn-primary btn-sm">Sign In</a>
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
      <a href="#/login" onclick="document.getElementById('mobile-nav').classList.remove('open'); document.getElementById('hamburger-btn').classList.remove('open');">Sign In</a>
    </nav>
  </header>`;
}
