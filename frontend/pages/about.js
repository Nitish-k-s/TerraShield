// About – TerraShield Platform & Technology
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

export function renderAbout() {
  return `
  ${renderNavbar('about')}
  <main style="padding-top:var(--nav-height)">

    <!-- ═══ HERO SECTION ═══ -->
    <section style="position:relative;overflow:hidden;padding:var(--space-20) 0 var(--space-16);background:linear-gradient(180deg,#060e08 0%,#0a1a0f 40%,#0d2818 100%)">

      <!-- Nature vine ring overlay -->
      <div style="position:absolute;top:50%;left:50%;width:500px;height:500px;transform:translate(-50%,-50%);pointer-events:none;z-index:1;opacity:0.25">
        <svg viewBox="0 0 500 500" width="500" height="500">
          <circle cx="250" cy="250" r="120" fill="none" stroke="rgba(80,140,80,0.4)" stroke-width="2" stroke-dasharray="10,6">
            <animateTransform attributeName="transform" type="rotate" from="0 250 250" to="360 250 250" dur="30s" repeatCount="indefinite"/>
          </circle>
          <circle cx="250" cy="250" r="200" fill="none" stroke="rgba(80,140,80,0.2)" stroke-width="1.5" stroke-dasharray="6,8">
            <animateTransform attributeName="transform" type="rotate" from="360 250 250" to="0 250 250" dur="40s" repeatCount="indefinite"/>
          </circle>
          <text x="250" y="55" font-size="22" text-anchor="middle"><animateTransform attributeName="transform" type="rotate" from="0 250 250" to="360 250 250" dur="30s" repeatCount="indefinite"/>🍃</text>
          <text x="445" y="255" font-size="20" text-anchor="middle"><animateTransform attributeName="transform" type="rotate" from="360 250 250" to="0 250 250" dur="40s" repeatCount="indefinite"/>🌿</text>
          <text x="250" y="445" font-size="18" text-anchor="middle"><animateTransform attributeName="transform" type="rotate" from="0 250 250" to="360 250 250" dur="30s" repeatCount="indefinite"/>🌸</text>
        </svg>
      </div>

      <!-- Birds -->
      <svg style="position:absolute;top:15%;left:6%;z-index:6;opacity:0.55;animation:bird-fly 18s ease-in-out infinite" width="60" height="24" viewBox="0 0 50 20">
        <path d="M0,10 Q12,0 25,10 Q38,0 50,10" fill="none" stroke="#3a5a2a" stroke-width="2.5" stroke-linecap="round"><animate attributeName="d" values="M0,10 Q12,0 25,10 Q38,0 50,10;M0,10 Q12,6 25,10 Q38,6 50,10;M0,10 Q12,0 25,10 Q38,0 50,10" dur="0.5s" repeatCount="indefinite"/></path>
      </svg>
      <svg style="position:absolute;top:10%;right:10%;z-index:6;opacity:0.45;animation:bird-fly 22s ease-in-out 4s infinite" width="50" height="20" viewBox="0 0 50 20">
        <path d="M0,10 Q12,0 25,10 Q38,0 50,10" fill="none" stroke="#4a6a3a" stroke-width="2.5" stroke-linecap="round"><animate attributeName="d" values="M0,10 Q12,0 25,10 Q38,0 50,10;M0,10 Q12,6 25,10 Q38,6 50,10;M0,10 Q12,0 25,10 Q38,0 50,10" dur="0.6s" repeatCount="indefinite"/></path>
      </svg>

      <!-- Butterfly -->
      <svg style="position:absolute;top:18%;right:22%;z-index:6;opacity:0.5;animation:bird-fly 20s ease-in-out 2s infinite" width="50" height="40" viewBox="0 0 50 40">
        <ellipse cx="15" cy="16" rx="12" ry="9" fill="#e8a040" opacity="0.8"><animate attributeName="ry" values="9;3;9" dur="0.4s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="35" cy="16" rx="12" ry="9" fill="#e8a040" opacity="0.8"><animate attributeName="ry" values="9;3;9" dur="0.4s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="15" cy="24" rx="8" ry="6" fill="#d08030" opacity="0.6"><animate attributeName="ry" values="6;2;6" dur="0.4s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="35" cy="24" rx="8" ry="6" fill="#d08030" opacity="0.6"><animate attributeName="ry" values="6;2;6" dur="0.4s" repeatCount="indefinite"/></ellipse>
        <line x1="25" y1="8" x2="25" y2="32" stroke="#5a3a1a" stroke-width="1.5"/>
        <circle cx="25" cy="16" r="2" fill="#5a3a1a"/>
      </svg>

      <!-- Large wildflower clusters (left side) -->
      <svg style="position:absolute;bottom:12%;left:2%;z-index:6;opacity:0.6;pointer-events:none" width="140" height="120" viewBox="0 0 140 120">
        <line x1="20" y1="120" x2="18" y2="55" stroke="#4a7a3a" stroke-width="2.5"/>
        <line x1="18" y1="70" x2="5" y2="55" stroke="#4a7a3a" stroke-width="1.5"/>
        <circle cx="5" cy="50" r="6" fill="#7ab350" opacity="0.6"/>
        <circle cx="18" cy="45" r="10" fill="#e87ca0" opacity="0.7"/><circle cx="18" cy="45" r="5" fill="#f0c060" opacity="0.8"/>
        <line x1="55" y1="120" x2="58" y2="40" stroke="#4a7a3a" stroke-width="2.5"/>
        <line x1="58" y1="60" x2="72" y2="48" stroke="#4a7a3a" stroke-width="1.5"/>
        <circle cx="72" cy="43" r="5" fill="#7ab350" opacity="0.5"/>
        <circle cx="58" cy="30" r="12" fill="#c860a0" opacity="0.6"/><circle cx="58" cy="30" r="6" fill="#f0c060" opacity="0.7"/>
        <line x1="95" y1="120" x2="92" y2="50" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="92" cy="40" r="9" fill="#e8a040" opacity="0.7"/><circle cx="92" cy="40" r="4.5" fill="#f0d080" opacity="0.8"/>
        <line x1="125" y1="120" x2="123" y2="60" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="123" cy="52" r="7" fill="#d070b0" opacity="0.6"/><circle cx="123" cy="52" r="3.5" fill="#f0b060" opacity="0.7"/>
      </svg>

      <!-- Large wildflower cluster (right side) -->
      <svg style="position:absolute;bottom:14%;right:2%;z-index:6;opacity:0.55;pointer-events:none" width="120" height="100" viewBox="0 0 120 100">
        <line x1="20" y1="100" x2="18" y2="40" stroke="#4a7a3a" stroke-width="2.5"/>
        <circle cx="18" cy="30" r="11" fill="#d070b0" opacity="0.7"/><circle cx="18" cy="30" r="5.5" fill="#f0b060" opacity="0.8"/>
        <line x1="55" y1="100" x2="58" y2="35" stroke="#4a7a3a" stroke-width="2.5"/>
        <line x1="58" y1="55" x2="45" y2="42" stroke="#4a7a3a" stroke-width="1.5"/>
        <circle cx="45" cy="37" r="5" fill="#7ab350" opacity="0.5"/>
        <circle cx="58" cy="25" r="12" fill="#e87ca0" opacity="0.7"/><circle cx="58" cy="25" r="6" fill="#f0c060" opacity="0.8"/>
        <line x1="90" y1="100" x2="88" y2="45" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="88" cy="36" r="9" fill="#e8a040" opacity="0.6"/><circle cx="88" cy="36" r="4.5" fill="#f0d080" opacity="0.8"/>
      </svg>

      <!-- Extra butterfly (left) -->
      <svg style="position:absolute;top:35%;left:15%;z-index:6;opacity:0.35;animation:bird-fly 28s ease-in-out 8s infinite" width="35" height="28" viewBox="0 0 50 40">
        <ellipse cx="15" cy="16" rx="10" ry="8" fill="#c060a0" opacity="0.7"><animate attributeName="ry" values="8;3;8" dur="0.5s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="35" cy="16" rx="10" ry="8" fill="#c060a0" opacity="0.7"><animate attributeName="ry" values="8;3;8" dur="0.5s" repeatCount="indefinite"/></ellipse>
        <line x1="25" y1="10" x2="25" y2="30" stroke="#5a3a4a" stroke-width="1"/>
      </svg>

      <!-- Floating particles container -->
      <div id="about-hero-particles" style="position:absolute;inset:0;pointer-events:none;z-index:2"></div>

      <!-- Drifting clouds -->
      <svg style="position:absolute;top:12%;right:-8%;z-index:1;opacity:0.15;animation:drift-left 50s linear infinite" width="150" height="55" viewBox="0 0 160 60">
        <ellipse cx="80" cy="35" rx="65" ry="18" fill="rgba(74,222,128,0.1)" opacity="0.6"/>
        <ellipse cx="110" cy="30" rx="30" ry="12" fill="rgba(74,222,128,0.08)" opacity="0.4"/>
      </svg>
      <svg style="position:absolute;top:16%;left:-6%;z-index:1;opacity:0.1;animation:drift-right 42s linear 2s infinite" width="110" height="42" viewBox="0 0 120 50">
        <ellipse cx="60" cy="28" rx="50" ry="16" fill="rgba(74,222,128,0.08)" opacity="0.5"/>
      </svg>

      <!-- Mountain silhouettes -->
      <svg style="position:absolute;bottom:0;width:100%;z-index:3" preserveAspectRatio="none" viewBox="0 0 1440 200" height="30%">
        <path d="M0,110 C360,150 720,80 1080,120 C1200,130 1350,110 1440,100 L1440,200 L0,200Z" fill="rgba(10,30,18,0.6)"/>
      </svg>
      <svg style="position:absolute;bottom:0;width:100%;z-index:4" preserveAspectRatio="none" viewBox="0 0 1440 200" height="18%">
        <path d="M0,150 C240,135 480,160 720,145 C960,130 1200,155 1440,150 L1440,200 L0,200Z" fill="#0a1a0f"/>
      </svg>

      <!-- Content -->
      <div class="container" style="position:relative;z-index:10;text-align:center">
        <div class="hero-animate" style="margin-bottom:var(--space-4)">
          <span style="font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;padding:var(--space-2) var(--space-4);background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.2);border-radius:var(--radius-full);color:var(--color-primary);font-weight:var(--fw-bold);display:inline-flex;align-items:center;gap:var(--space-2)">
            <span class="material-symbols-outlined" style="font-size:0.875rem">smart_toy</span>
            About The Platform
          </span>
        </div>
        <h1 class="font-serif hero-animate" style="font-size:clamp(2rem,5vw,3rem);font-weight:var(--fw-bold);color:var(--color-slate-900);margin-bottom:var(--space-4)">Real-Time Ecological Intelligence</h1>
        <p class="hero-animate-delay" style="color:var(--color-slate-600);max-width:40rem;margin:0 auto;line-height:1.8">TerraShield is an AI-powered early warning system that detects invasive species outbreaks by correlating citizen field reports with satellite vegetation analysis.</p>
      </div>
    </section>

    <!-- Problem Statement -->
    <section class="section" style="position:relative;background:#0a1a0f;padding:var(--space-20) 0;overflow:hidden">
      <!-- Decorative leaf borders -->
      <div style="position:absolute;top:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,transparent,rgba(109,190,75,0.3),rgba(109,190,75,0.5),rgba(109,190,75,0.3),transparent)"></div>
      <!-- Nature side vines -->
      <svg style="position:absolute;top:10%;left:0;opacity:0.15;pointer-events:none" width="80" height="300" viewBox="0 0 80 300">
        <path d="M0,0 Q40,50 20,100 Q0,150 30,200 Q50,250 15,300" fill="none" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="20" cy="100" r="8" fill="#6dbe4b" opacity="0.4"/>
        <circle cx="30" cy="200" r="6" fill="#e87ca0" opacity="0.4"/>
        <circle cx="15" cy="300" r="7" fill="#e8a040" opacity="0.3"/>
      </svg>
      <svg style="position:absolute;top:5%;right:0;opacity:0.12;pointer-events:none" width="80" height="300" viewBox="0 0 80 300">
        <path d="M80,0 Q40,60 60,120 Q80,180 50,240 Q30,280 65,300" fill="none" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="60" cy="120" r="7" fill="#c860a0" opacity="0.4"/>
        <circle cx="50" cy="240" r="6" fill="#e8a040" opacity="0.3"/>
      </svg>
      <div class="container">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-16);align-items:center">
          <div class="reveal">
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-4);display:block">The Problem</span>
            <h2 style="font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:var(--fw-bold);margin-bottom:var(--space-4);line-height:1.3">Invasive species cost global economies $423 billion annually</h2>
            <p style="color:var(--color-slate-600);line-height:1.8;margin-bottom:var(--space-4)">Traditional field surveys detect invasive outbreaks 12–24 months after establishment. By then, containment costs increase exponentially and ecological damage becomes irreversible.</p>
            <p style="color:var(--color-slate-600);line-height:1.8">TerraShield reduces this detection gap to 6–12 months through correlated AI and satellite intelligence.</p>
          </div>
          <div class="reveal" data-delay="200" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
            <div class="card hover-lift" style="padding:var(--space-6);text-align:center">
              <span style="font-size:2rem;font-weight:var(--fw-bold);color:#ef4444">$423B</span>
              <p style="font-size:0.75rem;color:var(--color-slate-500);margin-top:var(--space-1)">Annual Global Cost</p>
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
    <section class="section" style="background:#0d1f14;padding:var(--space-20) 0;border-top:1px solid rgba(74,222,128,0.08)">
      <div class="container">
        <div class="section-header reveal" style="margin-bottom:var(--space-16)">
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-3);display:inline-block">Technology</span>
          <h2 class="section-title">Detection Architecture</h2>
          <div class="section-divider"></div>
        </div>

        <div class="three-col-grid">
          <div class="card hover-lift reveal" data-delay="0" style="padding:var(--space-8) var(--space-6)">
            <div style="width:3rem;height:3rem;border-radius:var(--radius-lg);background:rgba(74,222,128,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary)">smart_toy</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Computer Vision AI</h3>
            <p style="color:var(--color-slate-600);font-size:0.875rem;line-height:1.7">Deep learning models trained on 2M+ specimen images for species identification with confidence scoring and regional invasive status mapping.</p>
          </div>
          <div class="card hover-lift reveal" data-delay="100" style="padding:var(--space-8) var(--space-6)">
            <div style="width:3rem;height:3rem;border-radius:var(--radius-lg);background:rgba(74,222,128,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary)">satellite_alt</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Satellite Remote Sensing</h3>
            <p style="color:var(--color-slate-600);font-size:0.875rem;line-height:1.7">Multi-spectral vegetation index analysis (NDVI, EVI) detects abnormal growth patterns and land-cover changes at 10m resolution.</p>
          </div>
          <div class="card hover-lift reveal" data-delay="200" style="padding:var(--space-8) var(--space-6)">
            <div style="width:3rem;height:3rem;border-radius:var(--radius-lg);background:rgba(74,222,128,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary)">query_stats</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Risk Correlation Engine</h3>
            <p style="color:var(--color-slate-600);font-size:0.875rem;line-height:1.7">Spatial clustering algorithms correlate citizen report density with satellite anomalies to produce outbreak probability scores.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Designed For -->
    <section class="section" style="background:#0a1a0f;padding:var(--space-20) 0">
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
  ${renderFooter()}`;
}
