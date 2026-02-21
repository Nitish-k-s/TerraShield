// Footer Component
export function renderFooter() {
  return `
  <footer class="footer">
    <div class="container" style="position:relative;z-index:10;">
      <div class="footer-grid">
        <div>
          <div class="flex items-center gap-3" style="margin-bottom:var(--space-6)">
            <svg class="ts-logo" width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="shield-grad-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#1dacc9"/>
                  <stop offset="100%" stop-color="#2d5a4c"/>
                </linearGradient>
              </defs>
              <path d="M50 8 L88 28 L88 52 C88 74 72 90 50 96 C28 90 12 74 12 52 L12 28 Z" fill="url(#shield-grad-footer)" opacity="0.9"/>
              <path d="M50 30 C50 30 36 44 36 56 C36 64 42 70 50 70 C58 70 64 64 64 56 C64 44 50 30 50 30Z" fill="#fff" opacity="0.7"/>
            </svg>
            <h2 style="font-size:1.5rem;font-weight:var(--fw-bold);letter-spacing:-0.02em;color:var(--color-slate-800)">TerraShield</h2>
          </div>
          <p class="footer-desc">Real-Time Ecological Intelligence for Early Invasive Species Detection.</p>
          <div class="footer-social">
            <a href="#"><span class="material-symbols-outlined" style="font-size:1.125rem">share</span></a>
            <a href="#"><span class="material-symbols-outlined" style="font-size:1.125rem">mail</span></a>
          </div>
        </div>
        <div>
          <h4 class="footer-heading">Platform</h4>
          <div class="footer-link-list">
            <a href="#/alerts">Live Alerts</a>
            <a href="#/report">Report Sighting</a>
            <a href="#/about">Technology</a>
            <a href="#">API Documentation</a>
          </div>
        </div>
        <div>
          <h4 class="footer-heading">Organization</h4>
          <div class="footer-link-list">
            <a href="#/about">About</a>
            <a href="#">Research</a>
            <a href="#">Partnerships</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 TerraShield – Real-Time Ecological Intelligence for Early Invasive Species Detection.</p>
        <div class="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>`;
}
