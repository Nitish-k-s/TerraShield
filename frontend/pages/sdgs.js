// Alerts Page – Live Invasive Species Alerts
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

export function renderAlerts() {
  const alerts = [
    { species: 'Lantana camara', region: 'Western Ghats Corridor', reports: 142, confidence: 94, satellite: 'NDVI anomaly confirmed', level: 'critical', color: '#ef4444', time: '2h ago' },
    { species: 'Water Hyacinth', region: 'Kerala Backwaters', reports: 28, confidence: 87, satellite: 'Canopy analysis pending', level: 'elevated', color: '#f59e0b', time: '6h ago' },
    { species: 'Parthenium weed', region: 'Rajasthan Plains', reports: 15, confidence: 72, satellite: 'Verification in progress', level: 'elevated', color: '#f59e0b', time: '1d ago' },
    { species: 'Prosopis juliflora', region: 'Gujarat Dryland', reports: 64, confidence: 91, satellite: 'Crown dieback detected', level: 'critical', color: '#ef4444', time: '4h ago' },
    { species: 'Chromolaena odorata', region: 'Northeast India', reports: 8, confidence: 56, satellite: 'No anomaly detected', level: 'monitoring', color: '#1dacc9', time: '3d ago' },
    { species: 'Mikania micrantha', region: 'Assam Wetlands', reports: 33, confidence: 79, satellite: 'Water surface change detected', level: 'elevated', color: '#f59e0b', time: '12h ago' },
  ];

  const alertCards = alerts.map((a, i) => `
    <div class="card hover-lift reveal" data-delay="${i * 80}" style="padding:var(--space-6);border-left:3px solid ${a.color}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3)">
        <div style="display:flex;align-items:center;gap:var(--space-2)">
          <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:${a.color}"></span>
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:${a.color};text-transform:uppercase;letter-spacing:0.08em">${a.level}</span>
        </div>
        <span style="font-size:0.7rem;color:var(--color-slate-400)">${a.time}</span>
      </div>
      <h4 style="font-weight:var(--fw-bold);margin-bottom:var(--space-1)">${a.species}</h4>
      <p style="font-size:0.75rem;color:var(--color-slate-400);margin-bottom:var(--space-4)">${a.region}</p>
      <div style="display:flex;flex-direction:column;gap:var(--space-2);font-size:0.75rem;color:var(--color-slate-500)">
        <div style="display:flex;justify-content:space-between"><span>Citizen Reports</span><strong style="color:var(--color-slate-800)">${a.reports}</strong></div>
        <div style="display:flex;justify-content:space-between"><span>AI Confidence</span><strong style="color:var(--color-slate-800)">${a.confidence}%</strong></div>
        <div style="display:flex;justify-content:space-between"><span>Satellite</span><span style="color:${a.color};font-size:0.7rem">${a.satellite}</span></div>
      </div>
      <div style="margin-top:var(--space-4)">
        <div class="progress-bar" style="height:4px"><div class="progress-bar-fill" style="width:${a.confidence}%;background:${a.color}"></div></div>
      </div>
    </div>`).join('');

  return {
    html: `

  ${renderNavbar('alerts')}
  <main style="padding-top:var(--nav-height)">

    <!-- ═══ HERO SECTION ═══ -->
    <section style="position:relative;overflow:hidden;padding:var(--space-20) 0 var(--space-16);background:linear-gradient(180deg,#060e08 0%,#0a1a0f 40%,#0d2818 100%)">

      <!-- Nature ring overlay -->
      <div style="position:absolute;top:50%;left:50%;width:500px;height:500px;transform:translate(-50%,-50%);pointer-events:none;z-index:1;opacity:0.2">
        <svg viewBox="0 0 500 500" width="500" height="500">
          <circle cx="250" cy="250" r="80" fill="none" stroke="rgba(80,140,80,0.4)" stroke-width="2" stroke-dasharray="8,6">
            <animateTransform attributeName="transform" type="rotate" from="0 250 250" to="360 250 250" dur="25s" repeatCount="indefinite"/>
          </circle>
          <circle cx="250" cy="250" r="160" fill="none" stroke="rgba(80,140,80,0.25)" stroke-width="1.5">
            <animate attributeName="r" values="150;170;150" dur="5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="250" cy="250" r="220" fill="none" stroke="rgba(80,140,80,0.15)" stroke-width="1">
            <animate attributeName="r" values="210;230;210" dur="6s" repeatCount="indefinite"/>
          </circle>
          <text x="250" y="175" font-size="20" text-anchor="middle"><animateTransform attributeName="transform" type="rotate" from="0 250 250" to="360 250 250" dur="25s" repeatCount="indefinite"/>🍃</text>
          <text x="250" y="95" font-size="18" text-anchor="middle"><animateTransform attributeName="transform" type="rotate" from="360 250 250" to="0 250 250" dur="35s" repeatCount="indefinite"/>🌿</text>
          <text x="410" y="255" font-size="16" text-anchor="middle"><animateTransform attributeName="transform" type="rotate" from="0 250 250" to="360 250 250" dur="25s" repeatCount="indefinite"/>🌸</text>
        </svg>
      </div>

      <!-- Birds -->
      <svg style="position:absolute;top:12%;left:8%;z-index:6;opacity:0.55;animation:bird-fly 16s ease-in-out infinite" width="60" height="22" viewBox="0 0 50 20">
        <path d="M0,10 Q12,0 25,10 Q38,0 50,10" fill="none" stroke="#3a5a2a" stroke-width="2.5" stroke-linecap="round"><animate attributeName="d" values="M0,10 Q12,0 25,10 Q38,0 50,10;M0,10 Q12,6 25,10 Q38,6 50,10;M0,10 Q12,0 25,10 Q38,0 50,10" dur="0.5s" repeatCount="indefinite"/></path>
      </svg>
      <svg style="position:absolute;top:8%;right:12%;z-index:6;opacity:0.45;animation:bird-fly 20s ease-in-out 3s infinite" width="50" height="18" viewBox="0 0 50 20">
        <path d="M0,10 Q12,0 25,10 Q38,0 50,10" fill="none" stroke="#4a6a3a" stroke-width="2.5" stroke-linecap="round"><animate attributeName="d" values="M0,10 Q12,0 25,10 Q38,0 50,10;M0,10 Q12,6 25,10 Q38,6 50,10;M0,10 Q12,0 25,10 Q38,0 50,10" dur="0.55s" repeatCount="indefinite"/></path>
      </svg>

      <!-- Dragonfly -->
      <svg style="position:absolute;top:18%;left:50%;z-index:6;opacity:0.45;animation:bird-fly 25s ease-in-out 5s infinite" width="60" height="35" viewBox="0 0 50 30">
        <line x1="5" y1="15" x2="45" y2="15" stroke="#408060" stroke-width="2.5"/>
        <ellipse cx="45" cy="15" rx="5" ry="4" fill="#408060"/>
        <ellipse cx="22" cy="7" rx="14" ry="5" fill="rgba(100,180,140,0.5)" transform="rotate(-10 22 7)"><animate attributeName="ry" values="5;2;5" dur="0.15s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="22" cy="23" rx="14" ry="5" fill="rgba(100,180,140,0.5)" transform="rotate(10 22 23)"><animate attributeName="ry" values="5;2;5" dur="0.15s" repeatCount="indefinite"/></ellipse>
      </svg>

      <!-- Large wildflower cluster (left bottom) -->
      <svg style="position:absolute;bottom:15%;left:2%;z-index:6;opacity:0.6;pointer-events:none" width="140" height="110" viewBox="0 0 140 110">
        <line x1="18" y1="110" x2="15" y2="45" stroke="#4a7a3a" stroke-width="2.5"/>
        <line x1="15" y1="65" x2="4" y2="50" stroke="#4a7a3a" stroke-width="1.5"/>
        <circle cx="4" cy="45" r="5" fill="#7ab350" opacity="0.6"/>
        <circle cx="15" cy="35" r="10" fill="#e87ca0" opacity="0.7"/><circle cx="15" cy="35" r="5" fill="#f0c060" opacity="0.8"/>
        <line x1="55" y1="110" x2="58" y2="38" stroke="#4a7a3a" stroke-width="2.5"/>
        <line x1="58" y1="55" x2="70" y2="44" stroke="#4a7a3a" stroke-width="1.5"/>
        <circle cx="70" cy="39" r="5" fill="#7ab350" opacity="0.5"/>
        <circle cx="58" cy="28" r="12" fill="#c860a0" opacity="0.6"/><circle cx="58" cy="28" r="6" fill="#f0c060" opacity="0.7"/>
        <line x1="95" y1="110" x2="92" y2="48" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="92" cy="38" r="9" fill="#e8a040" opacity="0.7"/><circle cx="92" cy="38" r="4.5" fill="#f0d080" opacity="0.8"/>
        <line x1="125" y1="110" x2="122" y2="55" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="122" cy="47" r="7" fill="#d070b0" opacity="0.6"/><circle cx="122" cy="47" r="3.5" fill="#f0b060" opacity="0.7"/>
      </svg>

      <!-- Large wildflower cluster (right bottom) -->
      <svg style="position:absolute;bottom:18%;right:2%;z-index:6;opacity:0.55;pointer-events:none" width="120" height="100" viewBox="0 0 120 100">
        <line x1="18" y1="100" x2="16" y2="38" stroke="#4a7a3a" stroke-width="2.5"/>
        <circle cx="16" cy="28" r="11" fill="#d070b0" opacity="0.7"/><circle cx="16" cy="28" r="5.5" fill="#f0b060" opacity="0.8"/>
        <line x1="55" y1="100" x2="58" y2="32" stroke="#4a7a3a" stroke-width="2.5"/>
        <circle cx="58" cy="22" r="12" fill="#e87ca0" opacity="0.7"/><circle cx="58" cy="22" r="6" fill="#f0c060" opacity="0.8"/>
        <line x1="90" y1="100" x2="88" y2="42" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="88" cy="33" r="9" fill="#e8a040" opacity="0.6"/><circle cx="88" cy="33" r="4.5" fill="#f0d080" opacity="0.8"/>
      </svg>

      <!-- Blinking alert dots -->
      <div class="alert-dot" style="top:25%;left:15%;animation-delay:0s;opacity:0.6"></div>
      <div class="alert-dot warning" style="top:35%;right:20%;animation-delay:1.2s;opacity:0.5"></div>
      <div class="alert-dot" style="top:55%;left:40%;animation-delay:0.6s;opacity:0.4"></div>
      <div class="alert-dot warning" style="top:60%;right:35%;animation-delay:2s;opacity:0.5"></div>

      <!-- Floating particles -->
      <div id="alerts-hero-particles" style="position:absolute;inset:0;pointer-events:none;z-index:2"></div>

      <!-- Mountain silhouettes -->
      <svg style="position:absolute;bottom:0;width:100%;z-index:3" preserveAspectRatio="none" viewBox="0 0 1440 200" height="35%">
        <path d="M0,120L120,130C240,140,480,100,720,110C960,120,1200,140,1320,130L1440,120L1440,200L0,200Z" fill="rgba(10,30,18,0.6)"/>
      </svg>
      <svg style="position:absolute;bottom:0;width:100%;z-index:4" preserveAspectRatio="none" viewBox="0 0 1440 200" height="22%">
        <path d="M0,140L60,135C120,130,240,150,360,155C480,160,600,140,720,135C840,130,960,150,1080,155C1200,160,1320,140,1380,135L1440,130L1440,200L0,200Z" fill="#0a1a0f"/>
      </svg>

      <!-- Content -->
      <div class="container" style="position:relative;z-index:10;text-align:center">
        <div class="hero-animate" style="margin-bottom:var(--space-4)">
          <span style="font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;padding:var(--space-2) var(--space-4);background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.15);border-radius:var(--radius-full);color:#ef4444;font-weight:var(--fw-bold);display:inline-flex;align-items:center;gap:var(--space-2)">
            <span class="material-symbols-outlined" style="font-size:0.875rem;animation:pulse-ring 2s ease-in-out infinite">warning</span>
            Live Detection Network
          </span>
        </div>
        <h1 class="font-serif hero-animate" style="font-size:clamp(2rem,5vw,3rem);font-weight:var(--fw-bold);color:var(--color-slate-900);margin-bottom:var(--space-4)">Active Threat Alerts</h1>
        <p class="hero-animate-delay" style="color:var(--color-slate-600);max-width:38rem;margin:0 auto;line-height:1.8">Real-time AI-correlated invasive species detections from citizen reports and satellite monitoring across monitored regions.</p>
      </div>
    </section>

    <!-- ═══ LIVE STATUS BAR ═══ -->
    <section style="background:#0d1f14;border-bottom:1px solid rgba(74,222,128,0.08);padding:var(--space-4) 0">
      <div class="container">
<<<<<<< HEAD
        <div class="reveal" style="display:flex;align-items:center;justify-content:center;gap:var(--space-8);flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:var(--space-2)">
            <span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block;animation:pulse-ring 2s ease-in-out infinite"></span>
            <span style="font-size:0.75rem;font-weight:var(--fw-bold);color:var(--color-slate-600);text-transform:uppercase;letter-spacing:0.08em">System Active</span>
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-2)">
            <span class="material-symbols-outlined" style="font-size:1rem;color:var(--color-primary)">satellite_alt</span>
            <span style="font-size:0.8125rem;color:var(--color-slate-600)"><strong>12</strong> satellites monitoring</span>
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-2)">
            <span class="material-symbols-outlined" style="font-size:1rem;color:var(--color-primary)">location_on</span>
            <span style="font-size:0.8125rem;color:var(--color-slate-600)"><strong>847</strong> active zones</span>
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-2)">
            <span class="material-symbols-outlined" style="font-size:1rem;color:#ef4444">notifications_active</span>
            <span style="font-size:0.8125rem;color:var(--color-slate-600)"><strong>23</strong> new alerts today</span>
=======
        <div class="reveal" style="position:relative;border-radius:var(--radius-lg);overflow:hidden;background:rgba(74,93,78,0.05);border:1px solid var(--color-slate-200);min-height:20rem">
          <div id="alerts-map" style="width:100%;height:100%;min-height:20rem;"></div>
          <div style="position:absolute;bottom:var(--space-4);left:50%;transform:translateX(-50%);display:flex;gap:var(--space-6);font-size:0.7rem;color:var(--color-slate-400);z-index:1000;background:rgba(255,255,255,0.85);padding:4px 12px;border-radius:999px;pointer-events:none">
            <span style="display:flex;align-items:center;gap:var(--space-1)"><span style="width:6px;height:6px;border-radius:50%;background:#ef4444"></span>Critical</span>
            <span style="display:flex;align-items:center;gap:var(--space-1)"><span style="width:6px;height:6px;border-radius:50%;background:#f59e0b"></span>Elevated</span>
            <span style="display:flex;align-items:center;gap:var(--space-1)"><span style="width:6px;height:6px;border-radius:50%;background:#1dacc9"></span>Monitoring</span>
>>>>>>> 34cb9df1be9513923501b0d36d44c3d033a743fa
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ ALERTS GRID ═══ -->
    <section class="section" style="background:#0a1a0f;padding:var(--space-16) 0">
      <div class="container">
        <div class="section-header reveal" style="margin-bottom:var(--space-12)">
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#ef4444;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-3);display:inline-block">Critical Detections</span>
          <h2 class="section-title">Recent Threat Activity</h2>
          <div class="section-divider"></div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:var(--space-6)">
          <!-- Alert Card 1 -->
          <div class="card hover-lift reveal" data-delay="0" style="padding:var(--space-6);border-left:3px solid #ef4444;position:relative;overflow:hidden">
            <div style="position:absolute;top:0;right:0;width:60px;height:60px;background:radial-gradient(circle at top right,rgba(239,68,68,0.06),transparent 70%);pointer-events:none"></div>
            <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:var(--space-3)">
              <span style="font-size:0.625rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.1em;padding:var(--space-1) var(--space-3);background:rgba(239,68,68,0.08);color:#ef4444;border-radius:var(--radius-full)">Critical</span>
              <span style="font-size:0.75rem;color:var(--color-slate-400)">2 hours ago</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2);font-size:1rem">Japanese Knotweed Cluster</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.6;margin-bottom:var(--space-3)">AI detected 94% match for Fallopia japonica spread pattern. 12 citizen reports correlated with satellite NDVI anomaly.</p>
            <div style="display:flex;align-items:center;gap:var(--space-4)">
              <span style="display:flex;align-items:center;gap:var(--space-1);font-size:0.75rem;color:var(--color-slate-500)"><span class="material-symbols-outlined" style="font-size:0.875rem">location_on</span>Columbia River Basin, OR</span>
              <span style="display:flex;align-items:center;gap:var(--space-1);font-size:0.75rem;color:var(--color-slate-500)"><span class="material-symbols-outlined" style="font-size:0.875rem">group</span>12 reports</span>
            </div>
          </div>

          <!-- Alert Card 2 -->
          <div class="card hover-lift reveal" data-delay="100" style="padding:var(--space-6);border-left:3px solid #f59e0b;position:relative;overflow:hidden">
            <div style="position:absolute;top:0;right:0;width:60px;height:60px;background:radial-gradient(circle at top right,rgba(245,158,11,0.06),transparent 70%);pointer-events:none"></div>
            <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:var(--space-3)">
              <span style="font-size:0.625rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.1em;padding:var(--space-1) var(--space-3);background:rgba(245,158,11,0.08);color:#f59e0b;border-radius:var(--radius-full)">Elevated</span>
              <span style="font-size:0.75rem;color:var(--color-slate-400)">5 hours ago</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2);font-size:1rem">Spotted Lanternfly Migration</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.6;margin-bottom:var(--space-3)">Seasonal migration pattern detected via multi-spectral analysis. Population density increasing 40% above baseline.</p>
            <div style="display:flex;align-items:center;gap:var(--space-4)">
              <span style="display:flex;align-items:center;gap:var(--space-1);font-size:0.75rem;color:var(--color-slate-500)"><span class="material-symbols-outlined" style="font-size:0.875rem">location_on</span>Delaware Valley, PA</span>
              <span style="display:flex;align-items:center;gap:var(--space-1);font-size:0.75rem;color:var(--color-slate-500)"><span class="material-symbols-outlined" style="font-size:0.875rem">group</span>8 reports</span>
            </div>
          </div>

          <!-- Alert Card 3 -->
          <div class="card hover-lift reveal" data-delay="200" style="padding:var(--space-6);border-left:3px solid var(--color-primary);position:relative;overflow:hidden">
            <div style="position:absolute;top:0;right:0;width:60px;height:60px;background:radial-gradient(circle at top right,rgba(74,222,128,0.06),transparent 70%);pointer-events:none"></div>
            <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:var(--space-3)">
              <span style="font-size:0.625rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.1em;padding:var(--space-1) var(--space-3);background:rgba(74,222,128,0.1);color:var(--color-primary);border-radius:var(--radius-full)">Monitoring</span>
              <span style="font-size:0.75rem;color:var(--color-slate-400)">1 day ago</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2);font-size:1rem">Kudzu Expansion Anomaly</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.6;margin-bottom:var(--space-3)">Satellite detected 2.3km² vegetation coverage increase over 30 days. Cross-referencing with historical growth models.</p>
            <div style="display:flex;align-items:center;gap:var(--space-4)">
              <span style="display:flex;align-items:center;gap:var(--space-1);font-size:0.75rem;color:var(--color-slate-500)"><span class="material-symbols-outlined" style="font-size:0.875rem">location_on</span>Blue Ridge, NC</span>
              <span style="display:flex;align-items:center;gap:var(--space-1);font-size:0.75rem;color:var(--color-slate-500)"><span class="material-symbols-outlined" style="font-size:0.875rem">group</span>5 reports</span>
            </div>
          </div>

          <!-- Alert Card 4 -->
          <div class="card hover-lift reveal" data-delay="300" style="padding:var(--space-6);border-left:3px solid #ef4444;position:relative;overflow:hidden">
            <div style="position:absolute;top:0;right:0;width:60px;height:60px;background:radial-gradient(circle at top right,rgba(239,68,68,0.06),transparent 70%);pointer-events:none"></div>
            <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:var(--space-3)">
              <span style="font-size:0.625rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.1em;padding:var(--space-1) var(--space-3);background:rgba(239,68,68,0.08);color:#ef4444;border-radius:var(--radius-full)">Critical</span>
              <span style="font-size:0.75rem;color:var(--color-slate-400)">3 hours ago</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2);font-size:1rem">Asian Giant Hornet Sighting</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.6;margin-bottom:var(--space-3)">Computer vision confirmed Vespa mandarinia specimen. Immediate containment zone recommended within 8km radius.</p>
            <div style="display:flex;align-items:center;gap:var(--space-4)">
              <span style="display:flex;align-items:center;gap:var(--space-1);font-size:0.75rem;color:var(--color-slate-500)"><span class="material-symbols-outlined" style="font-size:0.875rem">location_on</span>Whatcom County, WA</span>
              <span style="display:flex;align-items:center;gap:var(--space-1);font-size:0.75rem;color:var(--color-slate-500)"><span class="material-symbols-outlined" style="font-size:0.875rem">group</span>3 reports</span>
            </div>
          </div>

          <!-- Alert Card 5 -->
          <div class="card hover-lift reveal" data-delay="400" style="padding:var(--space-6);border-left:3px solid #f59e0b;position:relative;overflow:hidden">
            <div style="position:absolute;top:0;right:0;width:60px;height:60px;background:radial-gradient(circle at top right,rgba(245,158,11,0.06),transparent 70%);pointer-events:none"></div>
            <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:var(--space-3)">
              <span style="font-size:0.625rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.1em;padding:var(--space-1) var(--space-3);background:rgba(245,158,11,0.08);color:#f59e0b;border-radius:var(--radius-full)">Elevated</span>
              <span style="font-size:0.75rem;color:var(--color-slate-400)">8 hours ago</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2);font-size:1rem">Emerald Ash Borer Spread</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.6;margin-bottom:var(--space-3)">Field survey data combined with canopy stress mapping shows 15% increase in affected tree coverage over 60 days.</p>
            <div style="display:flex;align-items:center;gap:var(--space-4)">
              <span style="display:flex;align-items:center;gap:var(--space-1);font-size:0.75rem;color:var(--color-slate-500)"><span class="material-symbols-outlined" style="font-size:0.875rem">location_on</span>Great Lakes Region, MI</span>
              <span style="display:flex;align-items:center;gap:var(--space-1);font-size:0.75rem;color:var(--color-slate-500)"><span class="material-symbols-outlined" style="font-size:0.875rem">group</span>19 reports</span>
            </div>
          </div>

          <!-- Alert Card 6 -->
          <div class="card hover-lift reveal" data-delay="500" style="padding:var(--space-6);border-left:3px solid var(--color-primary);position:relative;overflow:hidden">
            <div style="position:absolute;top:0;right:0;width:60px;height:60px;background:radial-gradient(circle at top right,rgba(74,222,128,0.06),transparent 70%);pointer-events:none"></div>
            <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:var(--space-3)">
              <span style="font-size:0.625rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.1em;padding:var(--space-1) var(--space-3);background:rgba(74,222,128,0.1);color:var(--color-primary);border-radius:var(--radius-full)">Monitoring</span>
              <span style="font-size:0.75rem;color:var(--color-slate-400)">2 days ago</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2);font-size:1rem">Zebra Mussel Colony Growth</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.6;margin-bottom:var(--space-3)">Water quality sensors and drone surveys indicate new Dreissena polymorpha colonies detected in reservoir intake systems.</p>
            <div style="display:flex;align-items:center;gap:var(--space-4)">
              <span style="display:flex;align-items:center;gap:var(--space-1);font-size:0.75rem;color:var(--color-slate-500)"><span class="material-symbols-outlined" style="font-size:0.875rem">location_on</span>Lake Powell, UT</span>
              <span style="display:flex;align-items:center;gap:var(--space-1);font-size:0.75rem;color:var(--color-slate-500)"><span class="material-symbols-outlined" style="font-size:0.875rem">group</span>7 reports</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ HOW ALERTS WORK ═══ -->
    <section class="section" style="background:#0d1f14;padding:var(--space-20) 0;position:relative;overflow:hidden">
      <!-- Decorative grid -->
      <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(74,222,128,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,0.03) 1px,transparent 1px);background-size:80px 80px;pointer-events:none"></div>

      <div class="container" style="position:relative;z-index:2">
        <div class="section-header reveal" style="margin-bottom:var(--space-16)">
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-3);display:inline-block">Detection Pipeline</span>
          <h2 class="section-title">How Our Alerts Work</h2>
          <div class="section-divider"></div>
        </div>

        <div class="three-col-grid">
          <div class="card hover-lift reveal" data-delay="0" style="padding:var(--space-8) var(--space-6);text-align:center;position:relative">
            <div style="position:absolute;top:var(--space-4);right:var(--space-4);font-size:3rem;font-weight:var(--fw-bold);color:rgba(74,222,128,0.08);line-height:1">01</div>
            <div style="width:3.5rem;height:3.5rem;border-radius:var(--radius-full);background:linear-gradient(135deg,rgba(74,222,128,0.15),rgba(74,222,128,0.05));display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:1.5rem">photo_camera</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Citizen Report</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.7">Field observers submit geo-tagged photos via the mobile app. AI immediately classifies the specimen.</p>
          </div>
          <div class="card hover-lift reveal" data-delay="150" style="padding:var(--space-8) var(--space-6);text-align:center;position:relative">
            <div style="position:absolute;top:var(--space-4);right:var(--space-4);font-size:3rem;font-weight:var(--fw-bold);color:rgba(74,222,128,0.08);line-height:1">02</div>
            <div style="width:3.5rem;height:3.5rem;border-radius:var(--radius-full);background:linear-gradient(135deg,rgba(74,222,128,0.15),rgba(74,222,128,0.05));display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:1.5rem">satellite_alt</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Satellite Cross-Check</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.7">Multi-spectral vegetation analysis validates reported locations against NDVI and land-cover anomalies.</p>
          </div>
          <div class="card hover-lift reveal" data-delay="300" style="padding:var(--space-8) var(--space-6);text-align:center;position:relative">
            <div style="position:absolute;top:var(--space-4);right:var(--space-4);font-size:3rem;font-weight:var(--fw-bold);color:rgba(74,222,128,0.08);line-height:1">03</div>
            <div style="width:3.5rem;height:3.5rem;border-radius:var(--radius-full);background:linear-gradient(135deg,rgba(74,222,128,0.15),rgba(74,222,128,0.05));display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:1.5rem">notifications_active</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Alert Generated</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.7">Correlated detections trigger severity-scored alerts sent to researchers, agencies, and nearby citizen monitors.</p>
          </div>
        </div>
      </div>
    </section>

  </main>
  ${renderFooter()}`,

    init() {
      function bootMap() {
        const mapEl = document.getElementById('alerts-map');
        if (!mapEl || !window.L) return;

        const map = window.L.map('alerts-map', {
          center: [20.5937, 78.9629],
          zoom: 5,
          zoomControl: true,
        });

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        const markers = [
          { lat: 18.5204, lng: 73.8567, type: 'critical', label: 'Lantana camara – Western Ghats' },
          { lat: 23.0225, lng: 72.5714, type: 'critical', label: 'Prosopis juliflora – Gujarat Dryland' },
          { lat: 26.9124, lng: 75.7873, type: 'elevated', label: 'Parthenium weed – Rajasthan Plains' },
          { lat: 9.9312, lng: 76.2673, type: 'elevated', label: 'Water Hyacinth – Kerala Backwaters' },
          { lat: 26.1445, lng: 91.7362, type: 'elevated', label: 'Chromolaena odorata – Northeast India' },
          { lat: 22.5726, lng: 88.3639, type: 'monitoring', label: 'Mikania micrantha – Assam Wetlands' },
        ];

        const colorMap = { critical: '#ef4444', elevated: '#f59e0b', monitoring: '#1dacc9' };

        markers.forEach(m => {
          const color = colorMap[m.type];
          window.L.circleMarker([m.lat, m.lng], {
            radius: 10,
            fillColor: color,
            color: '#fff',
            weight: 2,
            fillOpacity: 0.85,
          }).bindTooltip(m.label, { permanent: false, direction: 'top' }).addTo(map);
        });

        mapEl._leafletMap = map;
      }

      if (window.L) {
        bootMap();
      } else {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = bootMap;
        document.head.appendChild(script);
      }
    },

    cleanup() {
      const mapEl = document.getElementById('alerts-map');
      if (mapEl && mapEl._leafletMap) {
        mapEl._leafletMap.remove();
        mapEl._leafletMap = null;
      }
    },
  };
}
