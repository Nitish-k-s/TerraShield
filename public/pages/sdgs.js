// Alerts Page – Live Risk Map & Active Alerts
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

export function renderAlerts() {
  const alerts = [
    { species: 'Japanese Knotweed', region: 'North Atlantic Corridor', reports: 142, confidence: 94, satellite: 'NDVI anomaly confirmed', level: 'critical', color: '#ef4444', time: '2h ago' },
    { species: 'Asian Longhorn Beetle', region: 'Great Lakes Region', reports: 28, confidence: 87, satellite: 'Canopy analysis pending', level: 'elevated', color: '#f59e0b', time: '6h ago' },
    { species: 'Giant Hogweed', region: 'Pacific Northwest', reports: 15, confidence: 72, satellite: 'Verification in progress', level: 'elevated', color: '#f59e0b', time: '1d ago' },
    { species: 'Emerald Ash Borer', region: 'Upper Midwest', reports: 64, confidence: 91, satellite: 'Crown dieback detected', level: 'critical', color: '#ef4444', time: '4h ago' },
    { species: 'Spotted Lanternfly', region: 'Mid-Atlantic', reports: 8, confidence: 56, satellite: 'No anomaly detected', level: 'monitoring', color: '#1dacc9', time: '3d ago' },
    { species: 'Water Hyacinth', region: 'Gulf Coast Waterways', reports: 33, confidence: 79, satellite: 'Water surface change detected', level: 'elevated', color: '#f59e0b', time: '12h ago' },
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

  return `
  ${renderNavbar('alerts')}
  <main style="padding-top:var(--nav-height)">

    <!-- Header -->
    <section style="background:var(--color-primary-10);padding:var(--space-16) 0;position:relative">
      <div class="container" style="text-align:center">
        <div style="display:inline-flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-4)">
          <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#ef4444;animation:pulse-glow-red 2s infinite"></span>
          <span style="font-size:0.7rem;font-weight:var(--fw-bold);color:#ef4444;text-transform:uppercase;letter-spacing:0.12em">Live Monitoring</span>
        </div>
        <h1 class="font-serif" style="font-size:clamp(2rem,5vw,2.75rem);font-weight:var(--fw-bold);color:var(--color-slate-900);margin-bottom:var(--space-3)">Active Ecological Alerts</h1>
        <p style="color:var(--color-slate-600);max-width:36rem;margin:0 auto">Emerging clusters are continuously monitored. High-confidence outbreak zones are flagged in real time.</p>
      </div>
    </section>

    <!-- Map -->
    <section style="background:#fff;padding:var(--space-12) 0;border-bottom:1px solid var(--color-slate-200)">
      <div class="container">
        <div class="reveal" style="position:relative;border-radius:var(--radius-lg);overflow:hidden;background:rgba(74,93,78,0.05);border:1px solid var(--color-slate-200);min-height:20rem;display:flex;align-items:center;justify-content:center">
          <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(29,172,201,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(29,172,201,0.04) 1px,transparent 1px);background-size:25px 25px"></div>
          <div class="map-dot critical" style="top:25%;left:22%"></div>
          <div class="map-dot critical" style="top:35%;right:35%"></div>
          <div class="map-dot elevated" style="top:50%;left:45%"></div>
          <div class="map-dot elevated" style="top:40%;left:65%"></div>
          <div class="map-dot monitoring" style="bottom:30%;left:55%"></div>
          <div class="map-dot elevated" style="bottom:35%;right:25%"></div>
          <div style="text-align:center;position:relative;z-index:2">
            <span class="material-symbols-outlined" style="font-size:3rem;color:rgba(29,172,201,0.2);display:block;margin-bottom:var(--space-3)">public</span>
            <p style="color:var(--color-slate-400);font-size:0.8125rem">Interactive risk map – visualization placeholder</p>
          </div>
          <div style="position:absolute;bottom:var(--space-4);left:50%;transform:translateX(-50%);display:flex;gap:var(--space-6);font-size:0.7rem;color:var(--color-slate-400)">
            <span style="display:flex;align-items:center;gap:var(--space-1)"><span style="width:6px;height:6px;border-radius:50%;background:#ef4444"></span>Critical</span>
            <span style="display:flex;align-items:center;gap:var(--space-1)"><span style="width:6px;height:6px;border-radius:50%;background:#f59e0b"></span>Elevated</span>
            <span style="display:flex;align-items:center;gap:var(--space-1)"><span style="width:6px;height:6px;border-radius:50%;background:#1dacc9"></span>Monitoring</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Alert Grid -->
    <section style="background:var(--color-bg-light);padding:var(--space-16) 0">
      <div class="container">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-8);flex-wrap:wrap;gap:var(--space-4)">
          <h2 style="font-weight:var(--fw-bold);color:var(--color-slate-900)">Current Alerts</h2>
          <div style="display:flex;gap:var(--space-3)">
            <button class="btn btn-sm" style="background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2)">Critical</button>
            <button class="btn btn-sm" style="background:rgba(245,158,11,0.1);color:#f59e0b;border:1px solid rgba(245,158,11,0.2)">Elevated</button>
            <button class="btn btn-sm" style="background:rgba(29,172,201,0.1);color:var(--color-primary);border:1px solid rgba(29,172,201,0.2)">All</button>
          </div>
        </div>
        <div class="three-col-grid">${alertCards}</div>
      </div>
    </section>
  </main>
  ${renderFooter()}`;
}
