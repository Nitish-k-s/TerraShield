// Statistics – District-Level Ecological Intelligence Dashboard
import { renderNavbar, initNavbarAuth } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { getSessionToken } from '../utils/auth.js';

// ─── Colour helpers ────────────────────────────────────────────────────────────
const RISK_COLOR = { Critical: '#ef4444', Elevated: '#f59e0b', Monitoring: '#2edd82' };
const RISK_BG = { Critical: 'rgba(239,68,68,0.12)', Elevated: 'rgba(245,158,11,0.12)', Monitoring: 'rgba(46,221,130,0.08)' };

function riskColor(level) { return RISK_COLOR[level] || '#2edd82'; }
function riskBg(level) { return RISK_BG[level] || 'rgba(46,221,130,0.08)'; }
function scoreToLevel(s) { return s >= 7 ? 'Critical' : s >= 4 ? 'Elevated' : 'Monitoring'; }
function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

// ─── SVG Chart Helpers ────────────────────────────────────────────────────────

/** Mini horizontal bar (returns SVG string) */
function miniBar(val, max, color = '#2edd82', h = 6) {
  const w = max > 0 ? Math.round((val / max) * 100) : 0;
  return `<div style="width:100%;height:${h}px;background:rgba(255,255,255,0.06);border-radius:999px;overflow:hidden">
    <div style="height:100%;width:${w}%;background:${color};border-radius:999px;transition:width 0.6s ease"></div></div>`;
}

/** Donut SVG */
function donutSVG(low, moderate, high) {
  const total = low + moderate + high || 1;
  const r = 48; const cx = 60; const cy = 60;
  const circ = 2 * Math.PI * r;
  const lowA = (low / total) * circ;
  const modA = (moderate / total) * circ;
  const highA = (high / total) * circ;
  // offsets: high starts at top, then moderate, then low
  const highOff = 0;
  const modOff = circ - highA;
  const lowOff = circ - highA - modA;
  const arc = (len, gap, offset, color) =>
    `<circle r="${r}" cx="${cx}" cy="${cy}" fill="none" stroke="${color}" stroke-width="14"
      stroke-dasharray="${len} ${gap}" stroke-dashoffset="${offset}" stroke-linecap="butt"
      style="transform:rotate(-90deg);transform-origin:${cx}px ${cy}px"/>`;
  return `<svg width="120" height="120" viewBox="0 0 120 120">
    <circle r="${r}" cx="${cx}" cy="${cy}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="14"/>
    ${high > 0 ? arc(highA, circ - highA, highOff, '#ef4444') : ''}
    ${moderate > 0 ? arc(modA, circ - modA, modOff, '#f59e0b') : ''}
    ${low > 0 ? arc(lowA, circ - lowA, lowOff, '#2edd82') : ''}
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">${total}</text>
    <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="#6b7280" font-size="8">Reports</text>
  </svg>`;
}

/** Line chart SVG (last 30 days) */
function lineChartSVG(trends) {
  const W = 600, H = 120, pad = 10;
  const counts = trends.map(t => t.count);
  const maxC = Math.max(...counts, 1);
  const pts = counts.map((c, i) => {
    const x = pad + (i / (counts.length - 1 || 1)) * (W - pad * 2);
    const y = H - pad - ((c / maxC) * (H - pad * 2));
    return `${x},${y}`;
  }).join(' ');
  const areaBase = H - pad;
  const areaPoints = `${pad},${areaBase} ${pts} ${W - pad},${areaBase}`;
  // x-axis labels (every 5 days)
  const labels = trends.filter((_, i) => i % 5 === 0 || i === trends.length - 1)
    .map(t => {
      const i = trends.indexOf(t);
      const x = pad + (i / (counts.length - 1 || 1)) * (W - pad * 2);
      return `<text x="${x}" y="${H + 16}" text-anchor="middle" fill="#6b7280" font-size="9">${t.date.slice(5)}</text>`;
    }).join('');
  return `<svg viewBox="0 0 ${W} ${H + 20}" style="width:100%;height:auto;overflow:visible">
    <defs>
      <linearGradient id="lg-line" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2edd82" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#2edd82" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
    <polygon points="${areaPoints}" fill="url(#lg-line)"/>
    <polyline points="${pts}" fill="none" stroke="#2edd82" stroke-width="2" stroke-linejoin="round"/>
    ${counts.map((c, i) => {
    const x = pad + (i / (counts.length - 1 || 1)) * (W - pad * 2);
    const y = H - pad - ((c / maxC) * (H - pad * 2));
    return c > 0 ? `<circle cx="${x}" cy="${y}" r="3" fill="#2edd82"/>` : ''
  }).join('')}
    ${labels}
  </svg>`;
}

export function renderStatistics() {
  return {
    html: `
  ${renderNavbar('statistics')}
  <main style="padding-top:var(--nav-height);min-height:100vh;background:linear-gradient(160deg,#03140c 0%,#051a0f 50%,#03140c 100%)">

    <!-- Hero -->
    <section style="padding:var(--space-14) 0 var(--space-12)">
      <div class="container">
        <div style="display:inline-flex;align-items:center;gap:var(--space-2);padding:0.25rem 0.75rem;border-radius:999px;background:rgba(46,221,130,0.08);border:1px solid rgba(46,221,130,0.2);margin-bottom:var(--space-4)">
          <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#2edd82;animation:pulse-glow 2s infinite"></span>
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#2edd82;text-transform:uppercase;letter-spacing:0.15em">District Ecological Intelligence</span>
        </div>
        <h1 class="font-serif" style="font-size:clamp(1.75rem,4vw,2.75rem);font-weight:var(--fw-bold);color:#fff;margin-bottom:var(--space-2)">Invasion Analytics Dashboard</h1>
        <p style="color:var(--color-slate-400);max-width:42rem;line-height:1.7;margin-bottom:var(--space-6)">District-level multi-species outbreak intelligence — backed by satellite validation and AI classification.</p>

        <!-- District Cascade Selector -->
        <div id="filter-bar" style="display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:center;margin-bottom:var(--space-8)">
          <select id="sel-country" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;padding:0.5rem 1rem;border-radius:var(--radius-md);font-size:0.82rem;cursor:pointer;min-width:10rem">
            <option value="">🌍 All Countries</option>
          </select>
          <select id="sel-state" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;padding:0.5rem 1rem;border-radius:var(--radius-md);font-size:0.82rem;cursor:pointer;min-width:10rem" disabled>
            <option value="">All States</option>
          </select>
          <select id="sel-district" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;padding:0.5rem 1rem;border-radius:var(--radius-md);font-size:0.82rem;cursor:pointer;min-width:12rem" disabled>
            <option value="">All Districts</option>
          </select>
          <button id="btn-reset" style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);color:#ef4444;padding:0.5rem 1rem;border-radius:var(--radius-md);font-size:0.78rem;cursor:pointer;font-weight:var(--fw-bold)" onclick="window._statsReset()">✕ Reset</button>
          <span id="filter-label" style="font-size:0.72rem;color:var(--color-slate-500)"></span>
        </div>
      </div>
    </section>

    <div class="container" style="padding-bottom:var(--space-20)" id="stats-root">

      <!-- Skeleton -->
      <div id="stats-skeleton" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:var(--space-6);margin-bottom:var(--space-8)">
        ${[...Array(6)].map(() => `<div style="height:6rem;border-radius:var(--radius-lg);background:rgba(255,255,255,0.04);animation:shimmer 1.5s infinite"></div>`).join('')}
      </div>

      <!-- All content (hidden while loading) -->
      <div id="stats-content" style="display:none">

        <!-- ① Overview Cards -->
        <div id="overview-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:var(--space-6);margin-bottom:var(--space-8)"></div>

        <!-- ② Risk Distribution + Outbreak Score (2-col) -->
        <div style="display:grid;grid-template-columns:3fr 2fr;gap:var(--space-6);margin-bottom:var(--space-8)">

          <!-- Donut -->
          <div class="card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:var(--radius-lg);padding:var(--space-6)">
            <div style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.15em;text-transform:uppercase;color:var(--color-slate-500);margin-bottom:var(--space-5)">Outbreak Risk Distribution</div>
            <div style="display:flex;align-items:center;gap:var(--space-8);justify-content:center;height:240px">
              <div id="donut-wrap" style="flex-shrink:0;position:relative;width:240px;height:240px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:inherit"></div>
              <div id="donut-legend" style="flex:1;max-width:200px"></div>
            </div>
          </div>

          <!-- Outbreak Confidence Score -->
          <div class="card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:var(--radius-lg);padding:var(--space-6)">
            <div style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.15em;text-transform:uppercase;color:var(--color-slate-500);margin-bottom:var(--space-4)">Outbreak Confidence Score</div>
            <div id="outbreak-score-panel"></div>
          </div>
        </div>

        <!-- ③ Top Districts Bar Chart -->
        <div class="simple-anim-card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:var(--radius-lg);padding:var(--space-6);margin-bottom:var(--space-8)">
          <div style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.15em;text-transform:uppercase;color:var(--color-slate-500);margin-bottom:var(--space-5)">🗺 Top Districts by Risk Score</div>
          <div id="top-districts-chart"></div>
        </div>

        <!-- ④ Species × District Matrix -->
        <div class="simple-anim-card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:var(--space-8)">
          <div style="padding:var(--space-5) var(--space-6);border-bottom:1px solid rgba(46,221,130,0.1);display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.15em;text-transform:uppercase;color:var(--color-slate-500)">🧬 Species × District Intelligence Matrix</span>
            <span style="font-size:0.7rem;color:var(--color-slate-600)">Cells = number of reports</span>
          </div>
          <div style="overflow-x:auto">
            <table id="species-matrix" style="border-collapse:collapse;font-size:0.78rem;width:100%;min-width:500px"></table>
          </div>
        </div>

        <!-- ⑤ Time Trend Line Chart -->
        <div class="simple-anim-card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:var(--radius-lg);padding:var(--space-6);margin-bottom:var(--space-8)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-5)">
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.15em;text-transform:uppercase;color:var(--color-slate-500)">📈 Reports per Day — Last 30 Days</span>
            <span id="trend-total" style="font-size:0.78rem;color:#2edd82;font-weight:var(--fw-bold)"></span>
          </div>
          <div id="trend-chart"></div>
        </div>

        <!-- ⑥ Alert Intelligence Panel -->
        <div class="simple-anim-card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:var(--space-8)">
          <div style="padding:var(--space-5) var(--space-6);border-bottom:1px solid rgba(239,68,68,0.15);display:flex;align-items:center;gap:var(--space-3)">
            <span style="width:8px;height:8px;border-radius:50%;background:#ef4444;animation:pulse-glow 1.5s infinite"></span>
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.15em;text-transform:uppercase;color:#ef4444">⚠ Active Alert Intelligence Panel</span>
            <span id="alert-count-badge" style="margin-left:auto;font-size:0.65rem;color:var(--color-slate-500)"></span>
          </div>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:0.75rem">
              <thead>
                <tr style="background:rgba(255,255,255,0.02)">
                  ${['Species', 'District / State', 'Coordinates', 'Risk Score', 'Label', 'Timestamp', ''].map(h =>
      `<th style="padding:var(--space-3) var(--space-5);text-align:left;font-size:0.6rem;font-weight:var(--fw-bold);letter-spacing:0.1em;text-transform:uppercase;color:var(--color-slate-500)">${h}</th>`
    ).join('')}
                </tr>
              </thead>
              <tbody id="alerts-tbody"></tbody>
            </table>
          </div>
        </div>

        <!-- ⑦ Outbreak Clusters -->
        <div class="simple-anim-card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:var(--space-8)">
          <div style="padding:var(--space-5) var(--space-6);border-bottom:1px solid rgba(255,255,255,0.06)">
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.15em;text-transform:uppercase;color:var(--color-slate-500)">🔴 Outbreak Cluster Map</span>
          </div>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:0.78rem">
              <thead>
                <tr style="background:rgba(255,255,255,0.02)">
                  ${['Species', 'Coordinates', 'Reports', 'Avg Risk', 'Level'].map(h =>
      `<th style="padding:var(--space-3) var(--space-5);text-align:left;font-size:0.6rem;font-weight:var(--fw-bold);letter-spacing:0.1em;text-transform:uppercase;color:var(--color-slate-500)">${h}</th>`
    ).join('')}
                </tr>
              </thead>
              <tbody id="clusters-tbody"></tbody>
            </table>
          </div>
        </div>

      </div><!-- /stats-content -->

      <!-- Empty state -->
      <div id="stats-empty" style="display:none;padding:var(--space-20);text-align:center;color:var(--color-slate-400)">
        <span class="material-symbols-outlined" style="font-size:3rem;opacity:0.3;display:block;margin-bottom:var(--space-4)">monitoring</span>
        <p style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">No analysed reports yet</p>
        <p style="font-size:0.85rem">Submit a sighting via the <a href="#/report" style="color:#2edd82">Report page</a> to start seeing district analytics.</p>
      </div>

    </div>
  </main>
  ${renderFooter()}`,

    async init() {
      initNavbarAuth();

      // shimmer style
      if (!document.getElementById('stats-shimmer-style')) {
        const s = document.createElement('style');
        s.id = 'stats-shimmer-style';
        s.textContent = `@keyframes shimmer{0%{opacity:0.6}50%{opacity:0.3}100%{opacity:0.6}}
          @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          select option{background:#0d1f0f;color:#fff}
          .simple-anim-card { transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
          .simple-anim-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(46,221,130,0.15); border-color: rgba(46,221,130,0.3) !important; }`;
        document.head.appendChild(s);
      }

      // ── District selector state ────────────────────────────────────────────
      let districtData = [];  // DistrictListRow[]
      let activeFilter = {};  // {country?, state?, district?}
      let currentToken = null;

      const selCountry = document.getElementById('sel-country');
      const selState = document.getElementById('sel-state');
      const selDistrict = document.getElementById('sel-district');
      const filterLabel = document.getElementById('filter-label');

      // ── Main data loader ─────────────────────────────────────────────────────
      async function loadStats(filter = {}) {
        const params = new URLSearchParams();
        if (filter.country) params.set('country', filter.country);
        if (filter.state) params.set('state', filter.state);
        if (filter.district) params.set('district', filter.district);
        const url = '/api/statistics' + (params.toString() ? '?' + params.toString() : '');

        const token = currentToken;
        const res = await fetch(url, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }

      // ── Render functions ──────────────────────────────────────────────────────

      // Initialize magnetic effect on all large cards (not overview cards)
      function initMagneticCards() {
        const largeCards = document.querySelectorAll('.card');

        largeCards.forEach(card => {
          let rect = card.getBoundingClientRect();
          let cx = rect.left + rect.width / 2;
          let cy = rect.top + rect.height / 2;
          let isNear = false;

          // Recalculate on scroll
          const updateRect = () => {
            rect = card.getBoundingClientRect();
            cx = rect.left + rect.width / 2;
            cy = rect.top + rect.height / 2;
          };
          window.addEventListener('scroll', updateRect, { passive: true });

          // Add will-change and transition
          card.style.willChange = 'transform';
          card.style.transition = 'transform 0.5s ease-in-out, box-shadow 0.3s ease';

          // Global mousemove for magnetic pull (reduced strength)
          const onGlobalMove = (e) => {
            const dx = Math.abs(cx - e.clientX);
            const dy = Math.abs(cy - e.clientY);
            const padding = 100; // Reduced from 150

            if (dx < rect.width / 2 + padding && dy < rect.height / 2 + padding) {
              if (!isNear) {
                isNear = true;
                card.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease';
              }
              const ox = (e.clientX - cx) / 8; // Reduced from /4 to /8
              const oy = (e.clientY - cy) / 8; // Reduced from /4 to /8
              card.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
            } else if (isNear) {
              isNear = false;
              card.style.transition = 'transform 0.5s ease-in-out, box-shadow 0.3s ease';
              card.style.transform = 'translate3d(0, 0, 0)';
            }
          };

          window.addEventListener('mousemove', onGlobalMove, { passive: true });

          // Add hover effects
          card.addEventListener('mouseenter', () => {
            card.style.boxShadow = '0 15px 40px rgba(0,0,0,0.4), 0 0 20px rgba(74,222,128,0.15)';
          });

          card.addEventListener('mouseleave', () => {
            card.style.boxShadow = 'none';
          });
        });
      }

      function renderOverviewCards(ov) {
        const cards = [
          { label: 'Total Reports', value: ov.total_reports.toLocaleString(), icon: 'description', color: '#2edd82' },
          { label: 'Invasive Species Reports', value: ov.invasive_count.toLocaleString(), icon: 'pest_control', color: '#ef4444' },
          { label: 'High-Risk Zones', value: ov.high_risk_zones.toLocaleString(), icon: 'warning', color: '#f59e0b' },
          { label: 'Active Clusters', value: ov.active_clusters.toLocaleString(), icon: 'hub', color: '#38bdf8' },
          { label: 'Top Species', value: ov.most_reported_species || '—', icon: 'eco', color: '#2edd82' },
        ];
        document.getElementById('overview-cards').innerHTML = cards.map((c, idx) => `
          <div class="magnetic-card" data-card-idx="${idx}" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:var(--radius-lg);padding:var(--space-6);transition:all 0.3s ease;min-height:6rem;display:flex;flex-direction:column;justify-content:space-between;transform-style:preserve-3d;will-change:transform" onmouseover="this.style.borderColor='${c.color}33'" onmouseout="this.style.borderColor='rgba(255,255,255,0.07)'">
            <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3)">
              <span class="material-symbols-outlined" style="color:${c.color};font-size:1.1rem">${c.icon}</span>
              <span style="font-size:0.6rem;font-weight:var(--fw-bold);letter-spacing:0.12em;text-transform:uppercase;color:var(--color-slate-500)">${c.label}</span>
            </div>
            <div style="font-size:1.5rem;font-weight:var(--fw-bold);color:#fff;font-family:monospace;word-break:break-word;line-height:1.2">${c.value}</div>
          </div>`).join('');

        // Add magnetic pull + 3D tilt effect to cards
        document.querySelectorAll('.magnetic-card').forEach(card => {
          const cardData = cards[card.dataset.cardIdx];
          let rect = card.getBoundingClientRect();
          let cx = rect.left + rect.width / 2;
          let cy = rect.top + rect.height / 2;
          let isNear = false;

          // Recalculate on scroll
          const updateRect = () => {
            rect = card.getBoundingClientRect();
            cx = rect.left + rect.width / 2;
            cy = rect.top + rect.height / 2;
          };
          window.addEventListener('scroll', updateRect, { passive: true });

          // Global mousemove for magnetic pull
          const onGlobalMove = (e) => {
            const dx = Math.abs(cx - e.clientX);
            const dy = Math.abs(cy - e.clientY);
            const padding = 80; // Reduced from 120

            if (dx < rect.width / 2 + padding && dy < rect.height / 2 + padding) {
              isNear = true;
              const ox = (e.clientX - cx) / 6; // Reduced from /3 to /6
              const oy = (e.clientY - cy) / 6; // Reduced from /3 to /6
              card.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
            } else if (isNear) {
              isNear = false;
              card.style.transform = 'translate3d(0, 0, 0)';
            }
          };

          window.addEventListener('mousemove', onGlobalMove, { passive: true });

          // Local mousemove for 3D tilt when hovering directly
          card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.2s';
          });

          card.addEventListener('mousemove', (e) => {
            const cardRect = card.getBoundingClientRect();
            const x = e.clientX - cardRect.left;
            const y = e.clientY - cardRect.top;
            const centerX = cardRect.width / 2;
            const centerY = cardRect.height / 2;
            const rotateX = (y - centerY) / 12; // Reduced from /8 to /12
            const rotateY = (centerX - x) / 12; // Reduced from /8 to /12

            const ox = (e.clientX - cx) / 6; // Reduced from /3 to /6
            const oy = (e.clientY - cy) / 6; // Reduced from /3 to /6

            card.style.transform = `translate3d(${ox}px, ${oy}px, 0) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`; // Reduced scale from 1.03 to 1.02
            card.style.boxShadow = `0 15px 40px rgba(0,0,0,0.4), 0 0 25px ${cardData.color}33`;
          });

          card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease-in-out, box-shadow 0.3s ease, border-color 0.2s';
            card.style.transform = 'translate3d(0, 0, 0) perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            card.style.boxShadow = 'none';
            isNear = false;
          });
        });
      }

      function renderDonut(rd) {
        const total = rd.low + rd.moderate + rd.high || 1;
        const legendHtml = [
          ['Low Risk', rd.low, '#2edd82', 'Low'],
          ['Moderate Risk', rd.moderate, '#f59e0b', 'Moderate'],
          ['High Risk', rd.high, '#ef4444', 'High'],
        ].map(([l, v, c, k]) => `
          <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);cursor:pointer;transition:all 0.2s" class="donut-legend-item" data-risk="${k}">
            <div style="width:10px;height:10px;border-radius:2px;background:${c};flex-shrink:0;box-shadow:0 0 8px ${c}40"></div>
            <div style="flex:1">
              <div style="font-size:0.78rem;color:#fff;font-weight:var(--fw-bold)">${l}</div>
              <div style="font-size:0.68rem;color:var(--color-slate-500)">${v} reports (${pct(v, total)}%)</div>
            </div>
          </div>`).join('');

        document.getElementById('donut-legend').innerHTML = legendHtml;

        if (window._donutFrameReq) cancelAnimationFrame(window._donutFrameReq);
        if (window._donutRenderer) {
          window._donutRenderer.dispose();
        }

        const bootThree = () => {
          const container = document.getElementById('donut-wrap');
          if (!container) return;
          container.innerHTML = '';

          const scene = new window.THREE.Scene();
          const camera = new window.THREE.PerspectiveCamera(45, 1, 0.1, 100);
          camera.position.z = 4.75;

          const renderer = new window.THREE.WebGLRenderer({ alpha: true, antialias: true });
          renderer.setSize(240, 240);
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.setScissorTest(true);
          renderer.setScissor(0, 0, 240, 240);
          container.appendChild(renderer.domElement);
          window._donutRenderer = renderer;

          const centerText = document.createElement('div');
          centerText.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;text-shadow:0 4px 12px rgba(0,0,0,0.8)';
          centerText.innerHTML = `<div style="font-size:1.5rem;font-weight:bold;color:#fff">${total}</div><div style="font-size:0.55rem;color:#9ca3af;text-transform:uppercase;letter-spacing:1px">Reports</div>`;
          container.appendChild(centerText);

          const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.85);
          scene.add(ambientLight);
          const dirLight = new window.THREE.DirectionalLight(0xffffff, 0.5);
          dirLight.position.set(2, 3, 5);
          scene.add(dirLight);

          const group = new window.THREE.Group();
          scene.add(group);

          let startAngle = 0;
          const slices = [];
          const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02, curveSegments: 32 };

          const createSlice = (val, colorHex, name) => {
            if (val <= 0) return;
            const angle = (val / total) * Math.PI * 2;
            const shape = new window.THREE.Shape();
            const outerR = 1.6;
            const innerR = 1.15;
            shape.absarc(0, 0, outerR, startAngle, startAngle + angle, false);
            shape.absarc(0, 0, innerR, startAngle + angle, startAngle, true);

            const geo = new window.THREE.ExtrudeGeometry(shape, extrudeSettings);
            const mat = new window.THREE.MeshPhongMaterial({ color: colorHex, shininess: 40 });
            const mesh = new window.THREE.Mesh(geo, mat);
            mesh.position.z = -0.075;

            group.add(mesh);
            const midAngle = startAngle + angle / 2;
            slices.push({ mesh, name, midAngle, tx: 0, ty: 0 });
            startAngle += angle;
          };

          createSlice(rd.high, 0xef4444, 'High');
          createSlice(rd.moderate, 0xf59e0b, 'Moderate');
          createSlice(rd.low, 0x2edd82, 'Low');

          const raycaster = new window.THREE.Raycaster();
          const mouse = new window.THREE.Vector2(-1, -1);
          let activeFromLegend = null;

          container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          });
          container.addEventListener('mouseleave', () => { mouse.x = -1; mouse.y = -1; });

          const legends = document.querySelectorAll('.donut-legend-item');
          legends.forEach(l => {
            l.addEventListener('mouseenter', () => { mouse.x = -2; activeFromLegend = l.dataset.risk; });
            l.addEventListener('mouseleave', () => { activeFromLegend = null; });
          });

          group.rotation.x = -0.6;
          group.rotation.y = -0.2;
          group.scale.set(0.01, 0.01, 0.01);

          const animate = () => {
            window._donutFrameReq = requestAnimationFrame(animate);

            group.rotation.x += (-0.3 - group.rotation.x) * 0.05;
            group.scale.x += (1 - group.scale.x) * 0.08;
            group.scale.y += (1 - group.scale.y) * 0.08;
            group.scale.z += (1 - group.scale.z) * 0.08;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(slices.map(s => s.mesh));
            let activeName = activeFromLegend || (intersects.length > 0 ? slices.find(s => s.mesh === intersects[0].object).name : null);

            legends.forEach(el => {
              if (el.dataset.risk === activeName) {
                el.style.transform = 'translateX(6px)';
                el.style.opacity = '1';
                el.style.filter = 'drop-shadow(0 0 4px rgba(255,255,255,0.2))';
              } else {
                el.style.transform = 'translateX(0)';
                el.style.opacity = activeName ? '0.4' : '1';
                el.style.filter = 'none';
              }
            });

            slices.forEach(s => {
              const isActive = (s.name === activeName);
              const targetDist = isActive ? 0.08 : 0;
              s.tx += (Math.cos(s.midAngle) * targetDist - s.tx) * 0.15;
              s.ty += (Math.sin(s.midAngle) * targetDist - s.ty) * 0.15;

              const maxOffset = 0.12;
              s.mesh.position.x = Math.max(-maxOffset, Math.min(s.tx, maxOffset));
              s.mesh.position.y = Math.max(-maxOffset, Math.min(s.ty, maxOffset));
              s.mesh.scale.setScalar(isActive ? 1.05 : 1.0);

              if (isActive) {
                s.mesh.material.emissive.setHex(s.mesh.material.color.getHex());
                s.mesh.material.emissiveIntensity = 0.35;
              } else {
                s.mesh.material.emissiveIntensity = 0;
              }
            });

            renderer.render(scene, camera);
          };
          animate();
        };

        if (window.THREE) bootThree();
        else {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
          s.onload = bootThree;
          document.head.appendChild(s);
        }
      }

      function renderOutbreakScore(osc) {
        const conf = osc.avg_ai_confidence;
        const risk = osc.avg_risk_score;
        const clusters = osc.active_clusters;
        const scoreColor = risk >= 7 ? '#ef4444' : risk >= 4 ? '#f59e0b' : '#2edd82';
        document.getElementById('outbreak-score-panel').innerHTML = `
          <div style="font-size:2.5rem;font-weight:var(--fw-bold);color:${scoreColor};font-family:monospace;margin-bottom:var(--space-3)">${risk}/10</div>
          <div style="font-size:0.7rem;color:var(--color-slate-500);margin-bottom:var(--space-4)">Avg AI Risk Score × Cluster Density</div>
          ${[
            ['AI Confidence', conf + '%', '#a78bfa'],
            ['Avg Risk Score', risk + '/10', scoreColor],
            ['Active Clusters', clusters, '#38bdf8'],
          ].map(([l, v, c]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2)">
              <span style="font-size:0.72rem;color:var(--color-slate-400)">${l}</span>
              <span style="font-size:0.78rem;font-weight:var(--fw-bold);color:${c}">${v}</span>
            </div>`).join('')}
          <div style="margin-top:var(--space-3);font-size:0.65rem;color:var(--color-slate-600);border-top:1px solid rgba(255,255,255,0.05);padding-top:var(--space-3)">
            Formula: AI Confidence × Cluster Density × Satellite Anomaly Score
          </div>`;
      }

      function renderTopDistricts(rows) {
        const maxRisk = Math.max(...rows.map(r => r.avg_risk), 1);
        document.getElementById('top-districts-chart').innerHTML = rows.length === 0
          ? `<p style="color:var(--color-slate-500);font-size:0.82rem;text-align:center;padding:var(--space-6)">No district data yet — submit reports with GPS to generate spatial intelligence.</p>`
          : rows.map(r => {
            const col = riskColor(r.risk_level);
            return `
              <div style="margin-bottom:var(--space-3)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                  <div>
                    <span style="font-weight:var(--fw-bold);color:#fff;font-size:0.82rem">${r.district}</span>
                    <span style="color:var(--color-slate-500);font-size:0.68rem;margin-left:0.5rem">${r.state || r.country || ''}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:var(--space-3)">
                    <span style="font-size:0.72rem;color:${col};font-weight:var(--fw-bold)">${r.avg_risk}/10</span>
                    <span style="font-size:0.6rem;font-weight:var(--fw-bold);color:${col};background:${riskBg(r.risk_level)};border:1px solid ${col}33;padding:0.15rem 0.5rem;border-radius:999px">${r.risk_level}</span>
                    <span style="font-size:0.68rem;color:var(--color-slate-500)">${r.report_count} rpts</span>
                  </div>
                </div>
                ${miniBar(r.avg_risk, maxRisk, col, 8)}
              </div>`;
          }).join('');
      }

      function renderSpeciesMatrix(rows) {
        if (rows.length === 0) {
          document.getElementById('species-matrix').innerHTML = `<tr><td style="padding:var(--space-8);text-align:center;color:var(--color-slate-500)">No species-district data yet.</td></tr>`;
          return;
        }
        // Build district → species → count map
        const districts = [...new Set(rows.map(r => r.district))];
        const allSpecies = [...new Set(rows.map(r => r.species))].slice(0, 8); // cap at 8 species columns
        const map = {};
        for (const r of rows) {
          if (!map[r.district]) map[r.district] = {};
          map[r.district][r.species] = r.count;
        }
        const maxCell = Math.max(...rows.map(r => r.count), 1);
        const headerCells = ['District/State', ...allSpecies, 'Total'].map(h =>
          `<th style="padding:var(--space-3) var(--space-4);text-align:left;font-size:0.6rem;font-weight:var(--fw-bold);letter-spacing:0.1em;text-transform:uppercase;color:var(--color-slate-500);white-space:nowrap;background:rgba(255,255,255,0.02)">${h}</th>`
        ).join('');
        const bodyRows = districts.map(d => {
          const dRows = rows.filter(r => r.district === d);
          const state = dRows[0]?.state || dRows[0]?.country || '';
          const total = Object.values(map[d] || {}).reduce((a, b) => a + b, 0);
          const cells = allSpecies.map(sp => {
            const v = map[d]?.[sp] || 0;
            const intensity = Math.round((v / maxCell) * 0.7 * 255);
            const bg = v > 0 ? `rgba(46,221,130,${(v / maxCell) * 0.35})` : 'transparent';
            return `<td style="padding:var(--space-3) var(--space-4);text-align:center;background:${bg};font-weight:${v > 0 ? 'bold' : 'normal'};color:${v > 0 ? '#fff' : 'var(--color-slate-600)'}">${v || '—'}</td>`;
          }).join('');
          return `<tr style="border-top:1px solid rgba(255,255,255,0.04)" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
            <td style="padding:var(--space-3) var(--space-5);min-width:8rem">
              <div style="font-weight:var(--fw-bold);color:#fff;font-size:0.8rem">${d}</div>
              <div style="font-size:0.65rem;color:var(--color-slate-500)">${state}</div>
            </td>
            ${cells}
            <td style="padding:var(--space-3) var(--space-4);text-align:center;font-weight:bold;color:#2edd82">${total}</td>
          </tr>`;
        }).join('');
        document.getElementById('species-matrix').innerHTML = `
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>`;
      }

      function renderTimeTrend(trends) {
        const total = trends.reduce((a, t) => a + t.count, 0);
        document.getElementById('trend-total').textContent = `${total} reports in 30 days`;
        document.getElementById('trend-chart').innerHTML = lineChartSVG(trends);
      }

      // ─── PDF download for individual alert rows ─────────────────────────────
      window._downloadAlertPdf = async function (btn, alertData) {
        const originalHtml = btn.innerHTML;
        try {
          btn.disabled = true;
          btn.style.position = 'relative';
          btn.style.overflow = 'hidden';
          btn.innerHTML = `
            <div style="position:absolute;left:0;top:-1px;bottom:-1px;background:rgba(56,189,248,0.25);width:0%;transition:width 5s cubic-bezier(0.1, 0.8, 0.2, 1)" id="pdf-prog-${alertData.id}"></div>
            <span style="position:relative;display:flex;align-items:center;gap:4px">
              <span class="material-symbols-outlined" style="font-size:0.9rem;animation:spin 1s linear infinite">progress_activity</span>
              Generating Satellite Report...
            </span>
          `;

          setTimeout(() => {
            const pb = document.getElementById('pdf-prog-' + alertData.id);
            if (pb) pb.style.width = '85%';
          }, 50);

          // Just send the record id — the server fetches all data from the DB
          const payload = {
            id: alertData.id,
            species: alertData.species || 'Unknown', // used only for filename
          };

          const headers = { 'Content-Type': 'application/json' };
          if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`;

          const res = await fetch('/api/report-quick', { method: 'POST', headers, body: JSON.stringify(payload) });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Error ${res.status}`);
          }

          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const safe = (alertData.species || 'report').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
          a.href = url;
          a.download = `TerraShield_${safe}_${new Date().toISOString().slice(0, 10)}.pdf`;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 5000);

          const pb = document.getElementById('pdf-prog-' + alertData.id);
          if (pb) {
            pb.style.transition = 'width 0.3s ease-out';
            pb.style.width = '100%';
          }
          await new Promise(r => setTimeout(r, 400));
          btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:0.9rem;color:#2edd82">check_circle</span>';
          setTimeout(() => { btn.innerHTML = originalHtml; btn.disabled = false; btn.style.overflow = ''; }, 3000);
        } catch (err) {
          btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:0.9rem;color:#ef4444">error</span>';
          btn.title = err.message;
          setTimeout(() => { btn.innerHTML = originalHtml; btn.disabled = false; btn.style.overflow = ''; }, 4000);
        }
      };

      function renderAlerts(alerts) {
        const badge = document.getElementById('alert-count-badge');
        badge.textContent = `${alerts.length} active alerts`;
        const tbody = document.getElementById('alerts-tbody');
        tbody.innerHTML = '';
        if (alerts.length === 0) {
          tbody.innerHTML = `<tr><td colspan="7" style="padding:var(--space-8);text-align:center;color:var(--color-slate-500);font-size:0.8rem">No high-risk alerts for selected filter</td></tr>`;
          return;
        }

        alerts.forEach(a => {
          const risk = a.ai_risk_score ?? 0;
          const level = scoreToLevel(risk);
          const col = riskColor(level);
          const coords = (a.latitude && a.longitude)
            ? `${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)}`
            : '—';
          const ts = a.ai_analysed_at ? new Date(a.ai_analysed_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

          const riskLevelStr = risk >= 7 ? 'Critical' : risk >= 4 ? 'Moderate' : 'Low';
          const alertJson = JSON.stringify({
            id: a.id,
            species: a.species,
            ai_confidence: a.ai_confidence ?? 0,
            ai_risk_score: a.ai_risk_score ?? 0,
            ai_label: a.ai_label || '',
            latitude: a.latitude ?? 0,
            longitude: a.longitude ?? 0,
            risk_level: riskLevelStr,
          }).replace(/'/g, '&#39;');

          const row = document.createElement('tr');
          row.style.borderTop = '1px solid rgba(255,255,255,0.04)';
          row.addEventListener('mouseenter', () => {
            row.style.background = 'rgba(255,255,255,0.02)';
          });
          row.addEventListener('mouseleave', () => {
            row.style.background = 'transparent';
          });

          row.innerHTML = `
            <td style="padding:var(--space-3) var(--space-5);font-style:italic;color:#fff;font-weight:bold">${a.species || '—'}</td>
            <td style="padding:var(--space-3) var(--space-5)">
              <div style="color:#fff;font-size:0.78rem">${a.district || '—'}</div>
              <div style="color:var(--color-slate-500);font-size:0.65rem">${a.state || a.country || ''}</div>
            </td>
            <td style="padding:var(--space-3) var(--space-5);font-family:monospace;font-size:0.7rem;color:var(--color-slate-400)">${coords}</td>
            <td style="padding:var(--space-3) var(--space-5)">
              <span style="font-weight:bold;color:${col}">${risk.toFixed(1)}/10</span>
            </td>
            <td style="padding:var(--space-3) var(--space-5)">
              <span style="font-size:0.65rem;font-weight:bold;background:${riskBg(level)};color:${col};border:1px solid ${col}33;padding:0.15rem 0.5rem;border-radius:999px;text-transform:uppercase">${a.ai_label || level}</span>
            </td>
            <td style="padding:var(--space-3) var(--space-5);color:var(--color-slate-500);font-size:0.7rem">${ts}</td>
            <td style="padding:var(--space-3) var(--space-4);text-align:right">
              <button
                onclick="window._downloadAlertPdf(this, JSON.parse(this.dataset.alert))"
                data-alert='${alertJson}'
                title="Download PDF Report"
                style="display:inline-flex;align-items:center;gap:4px;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;padding:0.25rem 0.6rem;border-radius:var(--radius-md);font-size:0.7rem;font-weight:var(--fw-bold);cursor:pointer;transition:background 0.2s,border 0.2s;white-space:nowrap"
                onmouseover="this.style.background='rgba(56,189,248,0.2)'"
                onmouseout="this.style.background='rgba(56,189,248,0.1)'"
              >
                <span class="material-symbols-outlined" style="font-size:0.9rem">picture_as_pdf</span>
                PDF
              </button>
            </td>
          `;
          tbody.appendChild(row);
        });
      }

      function renderClusters(clusters) {
        const tbody = document.getElementById('clusters-tbody');
        tbody.innerHTML = '';
        if (!clusters || clusters.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" style="padding:var(--space-8);text-align:center;color:var(--color-slate-500);font-size:0.8rem">No active outbreak clusters detected</td></tr>`;
          return;
        }

        clusters.forEach(c => {
          const col = riskColor(c.level === 'critical' ? 'Critical' : c.level === 'elevated' ? 'Elevated' : 'Monitoring');
          const row = document.createElement('tr');
          row.style.borderTop = '1px solid rgba(255,255,255,0.04)';
          row.addEventListener('mouseenter', () => {
            row.style.background = 'rgba(255,255,255,0.02)';
          });
          row.addEventListener('mouseleave', () => {
            row.style.background = 'transparent';
          });

          row.innerHTML = `
            <td style="padding:var(--space-4) var(--space-5);font-style:italic;font-weight:bold;color:#fff">${c.species}</td>
            <td style="padding:var(--space-4) var(--space-5);font-family:monospace;font-size:0.72rem;color:var(--color-slate-400)">${c.lat}, ${c.lon}</td>
            <td style="padding:var(--space-4) var(--space-5);font-weight:bold;color:#fff">${c.count}</td>
            <td style="padding:var(--space-4) var(--space-5)">
              <div style="display:flex;align-items:center;gap:var(--space-2)">
                <div style="width:3rem;height:3px;background:rgba(255,255,255,0.06);border-radius:999px;overflow:hidden">
                  <div style="height:100%;width:${Math.round(c.avg_risk * 10)}%;background:${col}"></div>
                </div>
                <span style="font-size:0.72rem;font-weight:bold;color:${col}">${c.avg_risk}/10</span>
              </div>
            </td>
            <td style="padding:var(--space-4) var(--space-5)">
              <span style="font-size:0.65rem;font-weight:bold;text-transform:uppercase;color:${col}">${c.level}</span>
            </td>
          `;
          tbody.appendChild(row);
        });
      }

      // ── Main render orchestrator ─────────────────────────────────────────────
      async function renderAll(filter = {}) {
        try {
          document.getElementById('stats-skeleton').style.display = 'grid';
          document.getElementById('stats-content').style.display = 'none';
          document.getElementById('stats-empty').style.display = 'none';

          const d = await loadStats(filter);
          if (!d.success) throw new Error(d.error || 'API error');

          const ov = d.overview || {};
          if (ov.total_reports === 0 && !filter.country && !filter.state && !filter.district) {
            document.getElementById('stats-skeleton').style.display = 'none';
            document.getElementById('stats-empty').style.display = 'block';
            return;
          }

          document.getElementById('stats-skeleton').style.display = 'none';
          document.getElementById('stats-content').style.display = 'block';

          renderOverviewCards(ov);
          renderDonut(d.risk_distribution || { low: 0, moderate: 0, high: 0 });
          renderOutbreakScore(d.outbreak_score_components || {});
          renderTopDistricts(d.top_districts || []);
          renderSpeciesMatrix(d.species_by_district || []);
          renderTimeTrend(d.time_trends || []);
          renderAlerts(d.alerts || []);
          renderClusters(d.clusters || []);

          // Initialize magnetic effect on all large cards
          initMagneticCards();

          // Populate district selectors on first load
          if (districtData.length === 0 && d.district_list) {
            districtData = d.district_list;
            populateSelectors(districtData);
          }

        } catch (err) {
          console.error('[statistics]', err);
          document.getElementById('stats-skeleton').style.display = 'none';
          document.getElementById('stats-empty').style.display = 'block';
        }
      }

      // ── Cascade Selector Population ──────────────────────────────────────────
      function populateSelectors(list) {
        const countries = [...new Set(list.map(r => r.country).filter(Boolean))].sort();
        selCountry.innerHTML = '<option value="">🌍 All Countries</option>' +
          countries.map(c => `<option value="${c}">${c}</option>`).join('');
      }

      function updateStateSelector(country) {
        const states = [...new Set(
          districtData.filter(r => !country || r.country === country).map(r => r.state).filter(Boolean)
        )].sort();
        selState.innerHTML = '<option value="">All States</option>' +
          states.map(s => `<option value="${s}">${s}</option>`).join('');
        selState.disabled = states.length === 0;
      }

      function updateDistrictSelector(country, state) {
        const districts = [...new Set(
          districtData
            .filter(r => (!country || r.country === country) && (!state || r.state === state))
            .map(r => r.district).filter(Boolean)
        )].sort();
        selDistrict.innerHTML = '<option value="">All Districts</option>' +
          districts.map(d => `<option value="${d}">${d}</option>`).join('');
        selDistrict.disabled = districts.length === 0;
      }

      // ── Selector event wiring ────────────────────────────────────────────────
      selCountry.addEventListener('change', () => {
        const c = selCountry.value;
        updateStateSelector(c);
        updateDistrictSelector(c, '');
        selState.value = '';
        selDistrict.value = '';
        activeFilter = c ? { country: c } : {};
        updateFilterLabel();
        renderAll(activeFilter);
      });

      selState.addEventListener('change', () => {
        const c = selCountry.value;
        const s = selState.value;
        updateDistrictSelector(c, s);
        selDistrict.value = '';
        activeFilter = { ...(c ? { country: c } : {}), ...(s ? { state: s } : {}) };
        updateFilterLabel();
        renderAll(activeFilter);
      });

      selDistrict.addEventListener('change', () => {
        const c = selCountry.value;
        const s = selState.value;
        const district = selDistrict.value;
        activeFilter = {
          ...(c ? { country: c } : {}),
          ...(s ? { state: s } : {}),
          ...(district ? { district } : {}),
        };
        updateFilterLabel();
        renderAll(activeFilter);
      });

      function updateFilterLabel() {
        const parts = [activeFilter.country, activeFilter.state, activeFilter.district].filter(Boolean);
        filterLabel.textContent = parts.length > 0 ? '📍 ' + parts.join(' › ') : '';
      }

      // Reset
      window._statsReset = () => {
        selCountry.value = '';
        selState.value = '';
        selDistrict.value = '';
        updateStateSelector('');
        updateDistrictSelector('', '');
        activeFilter = {};
        updateFilterLabel();
        renderAll({});
      };

      // ── Boot ─────────────────────────────────────────────────────────────────
      try {
        currentToken = await getSessionToken();
      } catch { /* no token */ }

      renderAll({});
    },
    cleanup() {
      if (window._donutFrameReq) cancelAnimationFrame(window._donutFrameReq);
      if (window._donutRenderer) window._donutRenderer.dispose();
    }
  };
}
