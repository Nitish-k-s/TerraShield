// Alerts Page – Live Risk Map & Active Alerts — all data from /api/public-reports
import { renderNavbar, initNavbarAuth } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

export function renderAlerts() {
  return {
    html: `
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
    <section style="background:linear-gradient(180deg, var(--color-bg-light) 0%, var(--color-bg-dark) 50%, var(--color-bg-light) 100%);padding:var(--space-12) 0;position:relative;overflow:hidden">
      <!-- Decorative ambient glow -->
      <div style="position:absolute;top:-100px;right:12%;width:350px;height:350px;border-radius:50%;background:radial-gradient(circle,rgba(74,222,128,0.05) 0%,transparent 70%);pointer-events:none;filter:blur(60px);animation:footer-orb-float 16s ease-in-out infinite"></div>

      <div class="container" style="position:relative;z-index:2">
        <div class="reveal" style="position:relative;border-radius:var(--radius-lg);overflow:hidden;background:rgba(15,35,20,0.5);border:1px solid rgba(74,222,128,0.15);min-height:20rem;box-shadow:0 8px 32px rgba(0,0,0,0.3)">
          <div id="alerts-map" style="width:100%;height:100%;min-height:20rem;"></div>
          <!-- Legend -->
          <div style="position:absolute;bottom:var(--space-4);left:50%;transform:translateX(-50%);display:flex;gap:var(--space-6);font-size:0.7rem;color:var(--color-slate-600);z-index:1000;background:rgba(10,26,15,0.85);backdrop-filter:blur(8px);padding:6px 16px;border-radius:999px;border:1px solid rgba(74,222,128,0.12);pointer-events:none">
            <span style="display:flex;align-items:center;gap:var(--space-1)"><span style="width:6px;height:6px;border-radius:50%;background:#ef4444"></span>Critical (≥7)</span>
            <span style="display:flex;align-items:center;gap:var(--space-1)"><span style="width:6px;height:6px;border-radius:50%;background:#f59e0b"></span>Elevated (4–7)</span>
            <span style="display:flex;align-items:center;gap:var(--space-1)"><span style="width:6px;height:6px;border-radius:50%;background:#1dacc9"></span>Monitoring (&lt;4)</span>
          </div>
          <!-- Map loading indicator -->
          <div id="map-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(10,26,15,0.7);backdrop-filter:blur(4px);z-index:999;pointer-events:none">
            <span style="font-size:0.85rem;color:var(--color-slate-600)">Loading live reports…</span>
          </div>
        </div>
        <p id="map-count" style="text-align:center;font-size:0.75rem;color:var(--color-slate-500);margin-top:var(--space-3)"></p>
      </div>
    </section>

    <!-- Alert Grid -->
    <section style="background:var(--color-bg-light);padding:var(--space-16) 0">
      <div class="container">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-8);flex-wrap:wrap;gap:var(--space-4)">
          <h2 style="font-weight:var(--fw-bold);color:var(--color-slate-900)">Outbreak Clusters</h2>
          <span id="cluster-count" style="font-size:0.75rem;color:var(--color-slate-500)"></span>
        </div>
        <div id="alerts-grid" class="three-col-grid">
          <!-- Skeleton cards -->
          ${[1, 2, 3].map(() => `
            <div class="card" style="padding:var(--space-6);opacity:0.5">
              <div style="height:0.75rem;background:var(--color-slate-200);border-radius:4px;margin-bottom:var(--space-3);width:40%"></div>
              <div style="height:1rem;background:var(--color-slate-200);border-radius:4px;margin-bottom:var(--space-2);width:80%"></div>
              <div style="height:0.75rem;background:var(--color-slate-200);border-radius:4px;width:60%"></div>
            </div>`).join('')}
        </div>
      </div>
    </section>
  </main>
  ${renderFooter()}`,

    init() {
      initNavbarAuth();

      // ── Colour helpers ──────────────────────────────────────────────────────
      function riskColor(score) {
        if (score >= 7) return '#ef4444';
        if (score >= 4) return '#f59e0b';
        return '#1dacc9';
      }
      function riskLabel(score) {
        if (score >= 7) return 'critical';
        if (score >= 4) return 'elevated';
        return 'monitoring';
      }

      // ── Render alert cards from cluster data ────────────────────────────────
      function renderAlertCards(clusters) {
        const grid = document.getElementById('alerts-grid');
        const counter = document.getElementById('cluster-count');
        if (!grid) return;

        if (!clusters || clusters.length === 0) {
          grid.innerHTML = `
            <div style="grid-column:1/-1;padding:var(--space-16);text-align:center;color:var(--color-slate-400);background:var(--color-slate-50);border-radius:var(--radius-lg);border:1px dashed var(--color-slate-300)">
              <span class="material-symbols-outlined" style="font-size:2.5rem;opacity:0.4;display:block;margin-bottom:var(--space-3)">sensors</span>
              <p style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">No outbreak clusters detected</p>
              <p style="font-size:0.85rem">Clusters appear when ≥3 invasive reports are within 5 km in the last 7 days.</p>
            </div>`;
          if (counter) counter.textContent = '';
          return;
        }

        if (counter) counter.textContent = `${clusters.length} active cluster${clusters.length === 1 ? '' : 's'}`;

        grid.innerHTML = clusters.map((c, i) => {
          const color = riskColor(c.avg_risk);
          const label = riskLabel(c.avg_risk);
          const confPct = Math.round(c.avg_risk * 10);
          return `
            <div class="card hover-lift reveal" data-delay="${i * 80}" style="padding:var(--space-6);border-left:3px solid ${color}">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3)">
                <div style="display:flex;align-items:center;gap:var(--space-2)">
                  <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:${color}"></span>
                  <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:${color};text-transform:uppercase;letter-spacing:0.08em">${label}</span>
                </div>
                <span style="font-size:0.7rem;color:var(--color-slate-400)">${c.count} report${c.count === 1 ? '' : 's'}</span>
              </div>
              <h4 style="font-weight:var(--fw-bold);margin-bottom:var(--space-1);font-style:italic">${c.species}</h4>
              <p style="font-size:0.75rem;color:var(--color-slate-400);margin-bottom:var(--space-4)">${c.lat.toFixed(4)}, ${c.lon.toFixed(4)}</p>
              <div style="display:flex;flex-direction:column;gap:var(--space-2);font-size:0.75rem;color:var(--color-slate-500)">
                <div style="display:flex;justify-content:space-between"><span>Risk Score</span><strong style="color:${color}">${c.avg_risk}/10</strong></div>
                <div style="display:flex;justify-content:space-between"><span>Citizen Reports</span><strong style="color:var(--color-slate-800)">${c.count}</strong></div>
              </div>
              <div style="margin-top:var(--space-4)">
                <div class="progress-bar" style="height:4px"><div class="progress-bar-fill" style="width:${confPct}%;background:${color}"></div></div>
              </div>
            </div>`;
        }).join('');
      }

      // ── Map boot ────────────────────────────────────────────────────────────
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
          maxZoom: 19,
        }).addTo(map);

        mapEl._leafletMap = map;

        // ── Fetch live data ────────────────────────────────────────────────
        fetch('/api/public-reports')
          .then(r => r.json())
          .then(data => {
            const loading = document.getElementById('map-loading');
            if (loading) loading.style.display = 'none';

            const reports = data.reports || [];
            const clusters = data.clusters || [];

            // Plot individual report markers
            reports.forEach(r => {
              const color = riskColor(r.risk_score);
              const dateStr = r.created_at;
              const confPct = Math.round(r.confidence * 100);
              window.L.circleMarker([r.lat, r.lon], {
                radius: 8,
                fillColor: color,
                color: color,
                weight: 2,
                fillOpacity: 0.85,
              }).bindPopup(`
                <div style="min-width:160px;font-family:inherit">
                  <strong style="font-style:italic">${r.species}</strong><br>
                  <span style="color:${color};font-weight:bold">Risk: ${r.risk_score}/10</span><br>
                  <span style="font-size:0.75rem;color:#64748b">Confidence: ${confPct}%</span><br>
                  <span style="font-size:0.75rem;color:#64748b">Reported: ${dateStr}</span>
                </div>
              `).addTo(map);
            });

            // Count display
            const countEl = document.getElementById('map-count');
            if (countEl) {
              countEl.textContent = reports.length > 0
                ? `${reports.length} invasive report${reports.length === 1 ? '' : 's'} from the last 30 days`
                : 'No invasive reports yet — submit one via the Report page';
            }

            // Render alert cards
            renderAlertCards(clusters);

            // Auto-fit bounds if there are markers
            if (reports.length > 0) {
              const latLngs = reports.map(r => [r.lat, r.lon]);
              try { map.fitBounds(latLngs, { padding: [40, 40], maxZoom: 10 }); } catch (_) { /* ignore */ }
            }
          })
          .catch(err => {
            console.error('[TerraShield] Failed to load public reports:', err);
            const loading = document.getElementById('map-loading');
            if (loading) {
              loading.innerHTML = '<span style="color:#ef4444;font-size:0.85rem">Failed to load live data</span>';
              loading.style.pointerEvents = 'none';
            }
            renderAlertCards([]);
          });
      }

      // ── Load Leaflet if not already present ─────────────────────────────
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
