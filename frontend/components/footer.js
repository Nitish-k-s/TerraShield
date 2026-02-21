// Footer Component – Animated, Nature-Themed
export function renderFooter() {
  const year = new Date().getFullYear();

  return `
  <footer class="footer">
    <!-- Animated top wave separator -->
    <div class="footer-wave-animated">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path class="footer-wave-1" d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,60 1440,40 L1440,120 L0,120 Z" fill="rgba(15,31,27,0.3)"/>
        <path class="footer-wave-2" d="M0,80 C240,40 480,100 720,60 C960,20 1200,80 1440,60 L1440,120 L0,120 Z" fill="rgba(15,31,27,0.6)"/>
        <path class="footer-wave-3" d="M0,90 C180,70 360,110 540,80 C720,50 900,100 1080,70 C1260,40 1380,80 1440,90 L1440,120 L0,120 Z" fill="#0f1f1b"/>
      </svg>
    </div>

    <!-- Floating particles background -->
    <div id="footer-particles" class="footer-particles"></div>

    <!-- Glowing orbs -->
    <div class="footer-glow footer-glow-1"></div>
    <div class="footer-glow footer-glow-2"></div>

    <div class="container" style="position:relative;z-index:10">

      <!-- Newsletter CTA -->
      <div class="footer-cta reveal">
        <div class="footer-cta-inner">
          <div>
            <h3 class="footer-cta-title">
              <span class="material-symbols-outlined" style="font-size:1.5rem;vertical-align:middle;color:var(--color-primary)">notifications_active</span>
              Stay Ahead of Outbreaks
            </h3>
            <p class="footer-cta-desc">Get AI-powered alerts when new invasive species threats emerge in your region.</p>
          </div>
          <div class="footer-cta-form">
            <div class="footer-email-wrap">
              <span class="material-symbols-outlined footer-email-icon">mail</span>
              <input type="email" placeholder="Enter your email" class="footer-email-input" />
            </div>
            <button class="btn btn-primary footer-subscribe-btn">
              <span class="material-symbols-outlined" style="font-size:1rem">send</span>
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <!-- Main grid -->
      <div class="footer-grid">
        <!-- Brand column -->
        <div>
          <div class="flex items-center gap-3" style="margin-bottom:var(--space-5)">
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
            <h2 style="font-size:1.5rem;font-weight:var(--fw-bold);letter-spacing:-0.02em;color:#fff">TerraShield</h2>
          </div>
          <p class="footer-desc">Real-Time Ecological Intelligence for Early Invasive Species Detection. Protecting ecosystems through AI and citizen science.</p>

          <!-- Animated stats ticker -->
          <div class="footer-stats">
            <div class="footer-stat">
              <span class="footer-stat-number" data-target="2847">0</span>
              <span class="footer-stat-label">Reports Filed</span>
            </div>
            <div class="footer-stat">
              <span class="footer-stat-number" data-target="142">0</span>
              <span class="footer-stat-label">Species Tracked</span>
            </div>
            <div class="footer-stat">
              <span class="footer-stat-number" data-target="94">0</span>
              <span class="footer-stat-label">% AI Accuracy</span>
            </div>
          </div>

          <div class="footer-social">
            <a href="#" aria-label="Twitter"><span class="material-symbols-outlined" style="font-size:1.125rem">share</span></a>
            <a href="#" aria-label="GitHub"><span class="material-symbols-outlined" style="font-size:1.125rem">code</span></a>
            <a href="#" aria-label="Email"><span class="material-symbols-outlined" style="font-size:1.125rem">mail</span></a>
            <a href="#" aria-label="Discord"><span class="material-symbols-outlined" style="font-size:1.125rem">forum</span></a>
          </div>
        </div>

        <!-- Platform links -->
        <div>
          <h4 class="footer-heading">Platform</h4>
          <div class="footer-link-list">
            <a href="#/alerts"><span class="material-symbols-outlined footer-link-icon">warning</span>Live Alerts</a>
            <a href="#/report"><span class="material-symbols-outlined footer-link-icon">add_a_photo</span>Report Sighting</a>
            <a href="#/about"><span class="material-symbols-outlined footer-link-icon">smart_toy</span>Technology</a>
            <a href="#"><span class="material-symbols-outlined footer-link-icon">api</span>API Documentation</a>
          </div>
        </div>

        <!-- Organization links -->
        <div>
          <h4 class="footer-heading">Organization</h4>
          <div class="footer-link-list">
            <a href="#/about"><span class="material-symbols-outlined footer-link-icon">info</span>About</a>
            <a href="#"><span class="material-symbols-outlined footer-link-icon">science</span>Research</a>
            <a href="#"><span class="material-symbols-outlined footer-link-icon">handshake</span>Partnerships</a>
            <a href="#"><span class="material-symbols-outlined footer-link-icon">contact_mail</span>Contact</a>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="footer-bottom">
        <p>&copy; ${year} TerraShield – Protecting biodiversity through intelligent early detection.</p>
        <div class="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Accessibility</a>
        </div>
      </div>
    </div>
  </footer>`;
}
