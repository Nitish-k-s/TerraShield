// About – TerraShield Platform & Technology
import { renderNavbar, initNavbarAuth } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

export function renderAbout() {
  return {
    html: `
  ${renderNavbar('about')}
  <main style="padding-top:var(--nav-height)">

    <!-- Header -->
    <section style="background:var(--color-primary-10);padding:var(--space-20) 0 var(--space-16);position:relative;overflow:hidden">
      <div class="container" style="position:relative;z-index:2;text-align:center">
        <span class="hero-animate" style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-4);display:inline-block">About The Platform</span>
        <h1 class="font-serif hero-animate" style="font-size:clamp(2rem,5vw,3rem);font-weight:var(--fw-bold);color:var(--color-slate-900);margin-bottom:var(--space-4)">Real-Time Ecological Intelligence</h1>
        <p class="hero-animate-delay" style="color:var(--color-slate-600);max-width:40rem;margin:0 auto;line-height:1.8">TerraShield is an AI-powered early warning system that detects invasive species outbreaks by correlating citizen field reports with satellite vegetation analysis.</p>
      </div>
    </section>

    <!-- Problem Statement -->
    <section class="section" style="background:var(--color-bg-light);padding:var(--space-20) 0">
      <div class="container">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-16);align-items:center">
          <div class="reveal">
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-4);display:block">The Problem</span>
            <h2 style="font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:var(--fw-bold);margin-bottom:var(--space-4);line-height:1.3">Invasive species cost India over ₹35,000 crore annually</h2>
            <p style="color:var(--color-slate-600);line-height:1.8;margin-bottom:var(--space-4)">Traditional field surveys detect invasive outbreaks 12–24 months after establishment. By then, containment costs increase exponentially and ecological damage becomes irreversible.</p>
            <p style="color:var(--color-slate-600);line-height:1.8">TerraShield reduces this detection gap to 6–12 months through correlated AI and satellite intelligence tailored for India's diverse ecosystems.</p>
          </div>
          <div class="reveal" data-delay="200" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
            <div class="card hover-lift" style="padding:var(--space-6);text-align:center">
              <span style="font-size:2rem;font-weight:var(--fw-bold);color:#ef4444">₹35K Cr</span>
              <p style="font-size:0.75rem;color:var(--color-slate-500);margin-top:var(--space-1)">Annual Cost to India</p>
            </div>
            <div class="card hover-lift" style="padding:var(--space-6);text-align:center">
              <span style="font-size:2rem;font-weight:var(--fw-bold);color:#f59e0b">12–24</span>
              <p style="font-size:0.75rem;color:var(--color-slate-500);margin-top:var(--space-1)">Months Detection Lag</p>
            </div>
            <div class="card hover-lift" style="padding:var(--space-6);text-align:center">
              <span style="font-size:2rem;font-weight:var(--fw-bold);color:var(--color-primary)">94%</span>
              <p style="font-size:0.75rem;color:var(--color-slate-500);margin-top:var(--space-1)">AI Classification Rate</p>
            </div>
            <div class="card hover-lift" style="padding:var(--space-6);text-align:center">
              <span style="font-size:2rem;font-weight:var(--fw-bold);color:var(--color-primary)">6–12</span>
              <p style="font-size:0.75rem;color:var(--color-slate-500);margin-top:var(--space-1)">Months Earlier Detection</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Technology Stack -->
    <section class="section" style="background:#fff;padding:var(--space-20) 0;border-top:1px solid var(--color-slate-200)">
      <div class="container">
        <div class="section-header reveal" style="margin-bottom:var(--space-16)">
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-3);display:inline-block">Technology</span>
          <h2 class="section-title">Detection Architecture</h2>
          <div class="section-divider"></div>
        </div>

        <div class="three-col-grid">
          <div class="card hover-lift reveal" data-delay="0" style="padding:var(--space-8) var(--space-6)">
            <div style="width:3rem;height:3rem;border-radius:var(--radius-lg);background:rgba(29,172,201,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary)">smart_toy</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Computer Vision AI</h3>
            <p style="color:var(--color-slate-600);font-size:0.875rem;line-height:1.7">Deep learning models trained on 2M+ specimen images for species identification with confidence scoring and regional invasive status mapping.</p>
          </div>
          <div class="card hover-lift reveal" data-delay="100" style="padding:var(--space-8) var(--space-6)">
            <div style="width:3rem;height:3rem;border-radius:var(--radius-lg);background:rgba(29,172,201,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary)">satellite_alt</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Satellite Remote Sensing</h3>
            <p style="color:var(--color-slate-600);font-size:0.875rem;line-height:1.7">Multi-spectral vegetation index analysis (NDVI, EVI) detects abnormal growth patterns and land-cover changes at 10m resolution.</p>
          </div>
          <div class="card hover-lift reveal" data-delay="200" style="padding:var(--space-8) var(--space-6)">
            <div style="width:3rem;height:3rem;border-radius:var(--radius-lg);background:rgba(29,172,201,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary)">query_stats</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Risk Correlation Engine</h3>
            <p style="color:var(--color-slate-600);font-size:0.875rem;line-height:1.7">Spatial clustering algorithms correlate citizen report density with satellite anomalies to produce outbreak probability scores.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Designed For -->
    <section class="section" style="background:var(--color-bg-light);padding:var(--space-20) 0">
      <div class="container">
        <div class="section-header reveal" style="margin-bottom:var(--space-12)">
          <h2 class="section-title">Designed For</h2>
          <div class="section-divider"></div>
        </div>

        <div class="three-col-grid">
          <div class="card hover-lift reveal" data-delay="0" style="padding:var(--space-8) var(--space-6);text-align:center">
            <span class="material-symbols-outlined" style="font-size:2.5rem;color:var(--color-primary);margin-bottom:var(--space-4);display:block">account_balance</span>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Government Agencies</h3>
            <p style="color:var(--color-slate-600);font-size:0.875rem;line-height:1.7">Environmental departments and biosecurity authorities requiring real-time outbreak intelligence.</p>
          </div>
          <div class="card hover-lift reveal" data-delay="100" style="padding:var(--space-8) var(--space-6);text-align:center">
            <span class="material-symbols-outlined" style="font-size:2.5rem;color:var(--color-primary);margin-bottom:var(--space-4);display:block">biotech</span>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Research Institutions</h3>
            <p style="color:var(--color-slate-600);font-size:0.875rem;line-height:1.7">Ecologists and conservation scientists analyzing species distribution and vegetation change data.</p>
          </div>
          <div class="card hover-lift reveal" data-delay="200" style="padding:var(--space-8) var(--space-6);text-align:center">
            <span class="material-symbols-outlined" style="font-size:2.5rem;color:var(--color-primary);margin-bottom:var(--space-4);display:block">groups</span>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Citizen Scientists</h3>
            <p style="color:var(--color-slate-600);font-size:0.875rem;line-height:1.7">Field observers contributing geo-tagged species reports that feed directly into the detection pipeline.</p>
          </div>
        </div>
      </div>
    </section>

  </main>
  ${renderFooter()}`,
    init() {
      initNavbarAuth();
    }
  };
}
