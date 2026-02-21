// Home Page – TerraShield: AI-Powered Invasive Species Early Warning System
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

export function renderHome() {
  return {
    html: `
  ${renderNavbar('home')}
  <main>
    <!-- HERO SECTION -->
    <section class="hero" id="hero-section">
      <div class="hero-bg">
        <div class="hero-sky" style="background:linear-gradient(180deg,#e0f2f1 0%,#e8f5f3 40%,#f0f8f6 100%)"></div>

        <!-- Sun -->
        <div class="hero-sun" id="layer-sun" data-speed="0.03" style="z-index:1">
          <svg width="100%" height="100%" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="50" fill="#ffecb3" opacity="0.9"/>
            <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,236,179,0.3)" stroke-width="1" style="animation:pulse-ring 4s ease-in-out infinite"/>
            <circle cx="70" cy="70" r="68" fill="none" stroke="rgba(255,236,179,0.15)" stroke-width="1" style="animation:pulse-ring 4s ease-in-out 1s infinite"/>
          </svg>
        </div>

        <!-- Clouds -->
        <svg style="position:absolute;top:12%;left:-10%;z-index:1;opacity:0.6;animation:drift-right 45s linear infinite" width="160" height="60" viewBox="0 0 160 60">
          <ellipse cx="80" cy="35" rx="70" ry="20" fill="#fff" opacity="0.8"/>
          <ellipse cx="55" cy="30" rx="40" ry="18" fill="#fff" opacity="0.6"/>
          <ellipse cx="110" cy="32" rx="35" ry="15" fill="#fff" opacity="0.5"/>
        </svg>
        <svg style="position:absolute;top:8%;right:-5%;z-index:1;opacity:0.4;animation:drift-left 55s linear 5s infinite" width="120" height="50" viewBox="0 0 120 50">
          <ellipse cx="60" cy="28" rx="55" ry="18" fill="#fff" opacity="0.7"/>
          <ellipse cx="40" cy="25" rx="30" ry="14" fill="#fff" opacity="0.5"/>
        </svg>

        <!-- Scanning grid overlay (subtle) -->
        <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(29,172,201,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(29,172,201,0.03) 1px,transparent 1px);background-size:60px 60px;z-index:1;pointer-events:none"></div>

        <!-- Blinking alert dots -->
        <div class="alert-dot" style="top:30%;left:18%;animation-delay:0s;opacity:0.5"></div>
        <div class="alert-dot" style="top:40%;right:25%;animation-delay:1.5s;opacity:0.5"></div>
        <div class="alert-dot warning" style="top:45%;left:50%;animation-delay:0.8s;opacity:0.5"></div>

        <!-- Floating particles -->
        <div id="hero-particles" style="position:absolute;inset:0;pointer-events:none;z-index:2"></div>

        <!-- Mountain layers with mouse parallax -->
        <div class="hero-mountains" id="layer-mountains" data-speed="0.06" style="z-index:3;animation:layer-wave-1 8s ease-in-out infinite">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1440 320" style="color:var(--color-paper-sage);filter:var(--paper-layer-1)">
            <path d="M0,192L80,181.3C160,171,320,149,480,165.3C640,181,800,235,960,245.3C1120,256,1280,224,1360,208L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" fill="currentColor"></path>
          </svg>
        </div>
        <div class="hero-valley" id="layer-valley" data-speed="0.12" style="z-index:4;animation:layer-wave-2 6s ease-in-out 0.5s infinite">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1440 320" style="color:rgba(194,163,142,0.6);filter:var(--paper-layer-2)">
            <path d="M0,224L60,213.3C120,203,240,181,360,192C480,203,600,245,720,250.7C840,256,960,224,1080,202.7C1200,181,1320,171,1380,165.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" fill="currentColor"></path>
          </svg>
        </div>
        <div class="hero-forest" id="layer-forest" data-speed="0.2" style="z-index:5;animation:layer-wave-3 5s ease-in-out 1s infinite">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1440 320" style="color:var(--color-paper-forest);filter:var(--paper-layer-3)">
            <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="currentColor"></path>
          </svg>
          <!-- Trees -->
          <svg style="position:absolute;bottom:40%;left:15%;opacity:0.4;animation:tree-sway 5s ease-in-out infinite" width="20" height="30" viewBox="0 0 20 30">
            <polygon points="10,0 0,20 20,20" fill="#3a4e3e"/><rect x="8" y="20" width="4" height="10" fill="#5a4a3a"/>
          </svg>
          <svg style="position:absolute;bottom:42%;right:25%;opacity:0.35;animation:tree-sway 4.5s ease-in-out 0.5s infinite" width="18" height="27" viewBox="0 0 20 30">
            <polygon points="10,0 0,20 20,20" fill="#3a4e3e"/><rect x="8" y="20" width="4" height="10" fill="#5a4a3a"/>
          </svg>
        </div>
      </div>

      <!-- Hero Content -->
      <div class="hero-content" id="hero-content-wrap" style="z-index:10">
        <div class="hero-animate" style="margin-bottom:var(--space-4)">
          <span style="font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;padding:var(--space-2) var(--space-4);background:rgba(29,172,201,0.1);border:1px solid rgba(29,172,201,0.2);border-radius:var(--radius-full);color:var(--color-primary);font-weight:var(--fw-bold);display:inline-flex;align-items:center;gap:var(--space-2)">
            <span class="material-symbols-outlined" style="font-size:0.875rem">radar</span>
            AI-Powered Ecological Intelligence
          </span>
        </div>

        <h1 class="hero-title hero-animate font-serif">Detect invasive species<br>before they spread.</h1>
        <p class="hero-subtitle hero-animate-delay">TerraShield combines citizen-submitted geo-tagged photos with AI classification and satellite vegetation analysis to identify invasive outbreaks 6–12 months earlier than traditional field surveys.</p>

        <div class="hero-buttons hero-animate-delay-2">
          <a href="#/report" class="btn btn-primary btn-lg btn-micro">
            <span class="material-symbols-outlined" style="font-size:1.125rem">photo_camera</span> Report a Sighting
          </a>
          <a href="#/alerts" class="btn btn-lg btn-micro" style="border:1px solid var(--color-primary);color:var(--color-primary);background:rgba(29,172,201,0.06)">
            <span class="material-symbols-outlined" style="font-size:1.125rem">map</span> View Live Risk Map
          </a>
        </div>

        <p class="hero-animate-delay-2" style="margin-top:var(--space-6);font-size:0.75rem;color:var(--color-slate-400);letter-spacing:0.05em">Real-time ecological intelligence powered by AI and remote sensing.</p>

        <!-- Scroll indicator -->
        <div class="hero-animate-delay-2" style="margin-top:var(--space-12);animation:bounce-slow 2s ease-in-out infinite">
          <a href="#how-it-works" style="display:flex;flex-direction:column;align-items:center;gap:var(--space-2);color:var(--color-slate-400);font-size:0.625rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.15em">
            <span>How it works</span>
            <span class="material-symbols-outlined" style="font-size:1.25rem">expand_more</span>
          </a>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS SECTION -->
    <section class="section" id="how-it-works" style="background:var(--color-bg-light);padding:var(--space-20) 0">
      <div class="container">
        <div class="section-header reveal" style="margin-bottom:var(--space-16)">
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-3);display:inline-block">Detection Pipeline</span>
          <h2 class="section-title" style="font-size:clamp(1.75rem,4vw,2.5rem)">How Early Detection Works</h2>
          <div class="section-divider"></div>
        </div>

        <div class="four-col-grid">
          <div class="card hover-lift reveal" data-delay="0" style="text-align:center;padding:var(--space-8) var(--space-6)">
            <div style="width:3.5rem;height:3.5rem;border-radius:50%;background:rgba(29,172,201,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:1.5rem">photo_camera</span>
            </div>
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.1em">Step 01</span>
            <h3 class="card-title" style="margin-top:var(--space-2)">Citizen Reporting</h3>
            <p class="card-text">Users upload geo-tagged photos of suspicious plants or animals observed in the field.</p>
          </div>

          <div class="card hover-lift reveal" data-delay="100" style="text-align:center;padding:var(--space-8) var(--space-6)">
            <div style="width:3.5rem;height:3.5rem;border-radius:50%;background:rgba(29,172,201,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:1.5rem">smart_toy</span>
            </div>
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.1em">Step 02</span>
            <h3 class="card-title" style="margin-top:var(--space-2)">AI Species Identification</h3>
            <p class="card-text">Our AI analyzes the image, identifies the species, estimates confidence, and determines invasive status within the region.</p>
          </div>

          <div class="card hover-lift reveal" data-delay="200" style="text-align:center;padding:var(--space-8) var(--space-6)">
            <div style="width:3.5rem;height:3.5rem;border-radius:50%;background:rgba(29,172,201,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:1.5rem">satellite_alt</span>
            </div>
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.1em">Step 03</span>
            <h3 class="card-title" style="margin-top:var(--space-2)">Satellite Change Detection</h3>
            <p class="card-text">Satellite vegetation indices detect abnormal land-cover or growth patterns in the same geographic area.</p>
          </div>

          <div class="card hover-lift reveal" data-delay="300" style="text-align:center;padding:var(--space-8) var(--space-6)">
            <div style="width:3.5rem;height:3.5rem;border-radius:50%;background:rgba(29,172,201,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:1.5rem">assessment</span>
            </div>
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.1em">Step 04</span>
            <h3 class="card-title" style="margin-top:var(--space-2)">Correlated Risk Scoring</h3>
            <p class="card-text">Citizen report clusters and satellite anomalies are combined to generate an outbreak risk score and trigger alerts.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- LIVE ALERTS SECTION -->
    <section class="section" style="background:#fff;padding:var(--space-20) 0;border-top:1px solid var(--color-slate-200)">
      <div class="container">
        <div class="section-header reveal" style="margin-bottom:var(--space-12)">
          <div style="display:inline-flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3)">
            <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#ef4444;animation:pulse-glow-red 2s infinite"></span>
            <span style="font-size:0.7rem;font-weight:var(--fw-bold);color:#ef4444;text-transform:uppercase;letter-spacing:0.12em">Live Monitoring</span>
          </div>
          <h2 class="section-title">Active Ecological Alerts</h2>
          <p class="section-subtitle" style="font-style:normal">Emerging clusters are continuously monitored. High-confidence outbreak zones are flagged in real time for environmental authorities.</p>
        </div>

        <div class="three-col-grid" style="margin-bottom:var(--space-10)">
          <div class="card hover-lift reveal" data-delay="0" style="padding:var(--space-6);border-left:3px solid #ef4444">
            <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3)">
              <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#ef4444"></span>
              <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#ef4444;text-transform:uppercase;letter-spacing:0.08em">Critical</span>
            </div>
            <h4 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Lantana camara Outbreak</h4>
            <p style="color:var(--color-slate-500);font-size:0.8125rem;line-height:1.6;margin-bottom:var(--space-4)">142 geo-tagged reports within 8 km radius. Satellite NDVI confirms vegetation anomaly in Western Ghats.</p>
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--color-slate-400)">
              <span>Risk Score: <strong style="color:#ef4444">94/100</strong></span>
              <span>2h ago</span>
            </div>
          </div>

          <div class="card hover-lift reveal" data-delay="100" style="padding:var(--space-6);border-left:3px solid #f59e0b">
            <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3)">
              <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#f59e0b"></span>
              <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#f59e0b;text-transform:uppercase;letter-spacing:0.08em">Elevated</span>
            </div>
            <h4 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Water Hyacinth Surge</h4>
            <p style="color:var(--color-slate-500);font-size:0.8125rem;line-height:1.6;margin-bottom:var(--space-4)">28 citizen reports. AI confidence 87%. Satellite surface analysis pending — Kerala Backwaters.</p>
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--color-slate-400)">
              <span>Risk Score: <strong style="color:#f59e0b">67/100</strong></span>
              <span>6h ago</span>
            </div>
          </div>

          <div class="card hover-lift reveal" data-delay="200" style="padding:var(--space-6);border-left:3px solid var(--color-primary)">
            <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3)">
              <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:var(--color-primary)"></span>
              <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.08em">Monitoring</span>
            </div>
            <h4 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Parthenium Spread</h4>
            <p style="color:var(--color-slate-500);font-size:0.8125rem;line-height:1.6;margin-bottom:var(--space-4)">15 reports across 3 districts. Satellite verification in progress — Rajasthan Plains.</p>
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--color-slate-400)">
              <span>Risk Score: <strong style="color:var(--color-primary)">42/100</strong></span>
              <span>1d ago</span>
            </div>
          </div>
        </div>

        <div class="text-center reveal" data-delay="300">
          <a href="#/alerts" class="btn btn-primary btn-lg btn-micro">
            <span class="material-symbols-outlined" style="font-size:1.125rem">explore</span> Explore Alert Map
          </a>
        </div>
      </div>
    </section>

    <!-- LIVE RISK MAP -->
    <section class="section" style="background:var(--color-bg-light);padding:var(--space-20) 0">
      <div class="container">
        <div class="section-header reveal" style="margin-bottom:var(--space-12)">
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-3);display:inline-block">Geospatial Analysis</span>
          <h2 class="section-title">Live Invasive Risk Map</h2>
          <p class="section-subtitle" style="font-style:normal">Visualize report clusters, vegetation anomalies, and outbreak confidence levels across regions.</p>
          <div class="section-divider"></div>
        </div>

        <div class="reveal" data-delay="100" style="position:relative;border-radius:var(--radius-lg);overflow:hidden;background:rgba(74,93,78,0.08);border:1px solid var(--color-slate-200);min-height:24rem;display:flex;align-items:center;justify-content:center">
          <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(29,172,201,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(29,172,201,0.04) 1px,transparent 1px);background-size:30px 30px"></div>
          <div class="map-dot critical" style="top:30%;left:25%"></div>
          <div class="map-dot elevated" style="top:45%;left:60%"></div>
          <div class="map-dot monitoring" style="top:55%;left:35%"></div>
          <div class="map-dot critical" style="top:25%;right:30%"></div>
          <div class="map-dot monitoring" style="top:65%;right:20%"></div>
          <div style="text-align:center;position:relative;z-index:2">
            <span class="material-symbols-outlined" style="font-size:4rem;color:rgba(29,172,201,0.2);margin-bottom:var(--space-4);display:block">public</span>
            <p style="color:var(--color-slate-400);font-size:0.875rem;margin-bottom:var(--space-4)">Interactive risk map visualization</p>
            <a href="#/alerts" class="btn btn-primary btn-sm">Launch Full Map</a>
          </div>
        </div>

        <div class="reveal" data-delay="200" style="display:flex;justify-content:center;gap:var(--space-8);margin-top:var(--space-6);font-size:0.75rem;color:var(--color-slate-500)">
          <span style="display:flex;align-items:center;gap:var(--space-2)"><span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#ef4444"></span> Critical (90+)</span>
          <span style="display:flex;align-items:center;gap:var(--space-2)"><span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#f59e0b"></span> Elevated (50-89)</span>
          <span style="display:flex;align-items:center;gap:var(--space-2)"><span style="width:0.5rem;height:0.5rem;border-radius:50%;background:var(--color-primary)"></span> Monitoring (&lt;50)</span>
        </div>
      </div>
    </section>

    <!-- EARLY WARNING NETWORK + EXPERT -->
    <section class="section" style="background:#fff;padding:var(--space-20) 0;border-top:1px solid var(--color-slate-200)">
      <div class="container">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-16);align-items:center">
          <div class="reveal">
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-4);display:block">Contribute</span>
            <h2 style="font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:var(--fw-bold);color:var(--color-slate-900);margin-bottom:var(--space-4);line-height:1.3">Become Part of the Early Warning Network</h2>
            <p style="color:var(--color-slate-600);line-height:1.8;margin-bottom:var(--space-8)">Every verified report strengthens ecological defense and enables faster containment of invasive species.</p>
            <a href="#/report" class="btn btn-primary btn-lg btn-micro">
              <span class="material-symbols-outlined" style="font-size:1.125rem">add_a_photo</span> Submit a Report
            </a>
          </div>

          <div class="reveal" data-delay="200">
            <div class="card" style="padding:var(--space-8)">
              <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-slate-400);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-6);display:block">Request Expert Validation</span>
              <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-3);font-size:1.25rem">Unsure about a species?</h3>
              <p style="color:var(--color-slate-600);font-size:0.875rem;line-height:1.7;margin-bottom:var(--space-6)">Submit your observation for expert review and containment recommendations.</p>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSe-I2Ebso1LPhh4mPHetvJXRMBkVqK73gtSxA9aZ_Ty109mkg/viewform?usp=header" target="_blank" rel="noopener noreferrer" class="btn btn-lg btn-micro" style="border:1px solid var(--color-primary);color:var(--color-primary);background:rgba(29,172,201,0.06);width:100%;justify-content:center">
                <span class="material-symbols-outlined" style="font-size:1.125rem">science</span> Contact an Expert
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- STATS BAR -->
    <section style="background:var(--color-bg-light);padding:var(--space-12) 0;border-top:1px solid var(--color-primary-10)">
      <div class="container">
        <div class="four-col-grid reveal" style="text-align:center">
          <div>
            <span class="stat-number" data-count="12847">0</span>
            <p class="stat-label">Reports Analyzed</p>
          </div>
          <div>
            <span class="stat-number" data-count="94" data-suffix="%">0</span>
            <p class="stat-label">AI Accuracy</p>
          </div>
          <div>
            <span class="stat-number" data-count="23">0</span>
            <p class="stat-label">Active Alerts</p>
          </div>
          <div>
            <span class="stat-number" data-count="6" data-suffix="–12 mo">0</span>
            <p class="stat-label">Earlier Detection</p>
          </div>
        </div>
      </div>
    </section>
  </main>
  ${renderFooter()}`,
    init() {
      const hero = document.getElementById('hero-section');
      if (!hero) return;

      const layers = [
        { el: document.getElementById('layer-sun'), speed: 0.005 },
        { el: document.getElementById('layer-mountains'), speed: 0.008 },
        { el: document.getElementById('layer-valley'), speed: 0.015 },
        { el: document.getElementById('layer-forest'), speed: 0.025 },
        { el: document.getElementById('hero-content-wrap'), speed: -0.01 },
      ];

      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;
        layers.forEach(({ el, speed }) => {
          if (!el) return;
          el.style.transform = 'translate(' + (cx * speed * 100) + 'px,' + (cy * speed * 60) + 'px)';
        });
      });

      hero.addEventListener('mouseleave', () => {
        layers.forEach(({ el }) => {
          if (!el) return;
          el.style.transition = 'transform 0.6s ease';
          el.style.transform = 'translate(0,0)';
          setTimeout(() => { el.style.transition = ''; }, 600);
        });
      });

      // Floating particles
      const container = document.getElementById('hero-particles');
      if (container) {
        const symbols = ['🍃', '🌿', '•', '✦'];
        for (let i = 0; i < 12; i++) {
          const p = document.createElement('span');
          p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
          p.style.cssText = 'position:absolute;font-size:' + (8 + Math.random() * 8) + 'px;opacity:0.15;animation:particle-float ' + (6 + Math.random() * 6) + 's ease-in-out ' + (Math.random() * 4) + 's infinite;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 70) + '%;pointer-events:none';
          container.appendChild(p);
        }
      }
    }
  };
}
