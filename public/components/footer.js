// Footer Component
export function renderFooter() {
  const isHidden = typeof window !== 'undefined' && (window.location.hash === '#/enterprise/register' || window.location.hash === '#/statistics');

  const ctaSection = isHidden ? '' : `
  <!-- Enterprise API CTA Section -->
  <section style="margin-top:-20px;margin-bottom:100px;display:flex;justify-content:center;align-items:center;background:linear-gradient(135deg, #041f16, #062e21, #031a12);position:relative">
    <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 30%, rgba(0,255,150,0.05), transparent 60%);pointer-events:none"></div>
    <div class="container" style="position:relative;z-index:2;max-width:800px;text-align:center">
      <div style="background:rgba(0,40,30,0.55);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(0,255,150,0.15);border-radius:20px;padding:var(--space-10) var(--space-8);box-shadow:0 0 40px rgba(0,255,150,0.08);transition:transform 0.4s ease-out, box-shadow 0.4s ease"
           onmousemove="
              const rect = this.getBoundingClientRect();
              const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
              const y = ((event.clientY - rect.top) / rect.height - 0.5) * 16;
              this.style.transform = \`translate(\${x}px, \${y}px)\`;
              this.style.boxShadow = '0 10px 50px rgba(0,255,150,0.15)';
              this.style.transition = 'none';
           "
           onmouseleave="
              this.style.transition = 'transform 0.5s ease-out, box-shadow 0.5s ease';
              this.style.transform = 'translate(0px, 0px)';
              this.style.boxShadow = '0 0 40px rgba(0,255,150,0.08)';
           ">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:rgba(46,221,130,0.1);color:#2edd82;margin-bottom:var(--space-4);pointer-events:none">
           <span class="material-symbols-outlined" style="font-size:1.8rem">api</span>
        </div>
        <h2 style="font-size:clamp(1.5rem, 3vw, 2rem);font-weight:bold;color:#e8fff5;margin-bottom:var(--space-3);font-family:serif;pointer-events:none">Enterprise Ecological Intelligence API</h2>
        <p style="color:rgba(200,255,220,0.7);font-size:1.05rem;line-height:1.6;margin-bottom:var(--space-6);max-width:600px;margin-left:auto;margin-right:auto;pointer-events:none">
          Integrate TerraShield’s district-level invasive species detection and satellite validation directly into your organization’s systems.
        </p>
        <div style="display:inline-block;padding:12px;">
          <a href="#/enterprise/register" 
             style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(90deg, #00c97b, #00ff9d);color:#002b1f;padding:0.75rem 1.5rem;border-radius:12px;font-weight:bold;font-size:1rem;text-decoration:none;transition:all 0.3s ease;box-shadow:0 0 20px rgba(0,255,150,0.3)" 
             onmouseover="this.style.boxShadow='0 0 30px rgba(0,255,150,0.5)';this.style.transform='translateY(-2px)'" 
             onmouseout="this.style.boxShadow='0 0 20px rgba(0,255,150,0.3)';this.style.transform='translateY(0)'">
            Request API Access
            <span class="material-symbols-outlined" style="font-size:1.1rem">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  </section>`;

  return `
${ctaSection}
  <footer class="footer">
    <div class="container" style="position:relative;z-index:10;">
    <div class="footer-grid">
      <div>
        <div class="flex items-center gap-3" style="margin-bottom:var(--space-6)">
          <svg class="ts-logo" width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="shield-grad-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1dacc9" />
                <stop offset="100%" stop-color="#2d5a4c" />
              </linearGradient>
            </defs>
            <path d="M50 8 L88 28 L88 52 C88 74 72 90 50 96 C28 90 12 74 12 52 L12 28 Z" fill="url(#shield-grad-footer)" opacity="0.9" />
            <path d="M50 30 C50 30 36 44 36 56 C36 64 42 70 50 70 C58 70 64 64 64 56 C64 44 50 30 50 30Z" fill="#fff" opacity="0.7" />
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
      <p>&copy; 2026 TerraShield – Real-Time Ecological Intelligence for Early Invasive Species Detection.</p>
      <div class="footer-bottom-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </div>
    </div>
  </div>
  </footer > `;
}
