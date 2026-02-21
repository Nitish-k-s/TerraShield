// Statistics Page – Ecological Intelligence Dashboard
import { renderNavbar, initNavbarAuth } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { getSessionToken } from '../utils/auth.js';

export function renderStatistics() {
    return {
        html: `
  ${renderNavbar('statistics')}
  <main style="padding-top:var(--nav-height);min-height:100vh;background:linear-gradient(160deg,#03140c 0%,#051a0f 50%,#03140c 100%)">

    <!-- Header -->
    <section style="padding:var(--space-16) 0 var(--space-8)">
      <div class="container">
        <div style="display:inline-flex;align-items:center;gap:var(--space-2);padding:0.25rem 0.75rem;border-radius:999px;background:rgba(46,221,130,0.08);border:1px solid rgba(46,221,130,0.2);margin-bottom:var(--space-5)">
          <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#2edd82;animation:pulse-glow 2s infinite"></span>
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#2edd82;text-transform:uppercase;letter-spacing:0.15em">AI-Powered Monitoring System</span>
        </div>
        <h1 class="font-serif" style="font-size:clamp(2rem,5vw,3.25rem);font-weight:var(--fw-bold);color:#fff;margin-bottom:var(--space-3)">Ecological Intelligence Dashboard</h1>
        <p style="color:var(--color-slate-400);max-width:38rem;line-height:1.7">Real-time terrestrial biosecurity analytics powered by satellite imagery and citizen-led AI validation.</p>
      </div>
    </section>

    <!-- Skeleton / Content wrapper -->
    <div class="container" style="padding-bottom:var(--space-20)">

      <!-- Skeleton shown while loading -->
      <div id="stats-skeleton">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:var(--space-5);margin-bottom:var(--space-8)">
          ${[1, 2, 3, 4].map(() => `<div style="height:7rem;border-radius:var(--radius-lg);background:rgba(255,255,255,0.04);animation:shimmer 1.5s infinite"></div>`).join('')}
        </div>
        <div style="height:18rem;border-radius:var(--radius-lg);background:rgba(255,255,255,0.04);animation:shimmer 1.5s infinite;margin-bottom:var(--space-8)"></div>
        <div style="height:14rem;border-radius:var(--radius-lg);background:rgba(255,255,255,0.04);animation:shimmer 1.5s infinite"></div>
      </div>

      <!-- Real content (hidden until data loads) -->
      <div id="stats-content" style="display:none">

        <!-- ── Metric Cards ────────────────────────────────────────────── -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:var(--space-5);margin-bottom:var(--space-8)">

          <div class="card hover-lift" style="padding:var(--space-6);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-4)">
              <span style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.12em;text-transform:uppercase;color:var(--color-slate-500)">Total Reports</span>
              <span class="material-symbols-outlined" style="color:#2edd82;font-size:1.25rem">description</span>
            </div>
            <div id="stat-total" class="font-serif" style="font-size:2.25rem;font-weight:var(--fw-bold);color:#fff" data-count="0">0</div>
            <div style="margin-top:var(--space-2);font-size:0.7rem;color:#2edd82;display:flex;align-items:center;gap:0.25rem">
              <span class="material-symbols-outlined" style="font-size:0.9rem">analytics</span>All time, AI-analysed
            </div>
          </div>

          <div class="card hover-lift" style="padding:var(--space-6);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-4)">
              <span style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.12em;text-transform:uppercase;color:var(--color-slate-500)">Active Clusters</span>
              <span class="material-symbols-outlined" style="color:#2edd82;font-size:1.25rem">biotech</span>
            </div>
            <div id="stat-clusters" class="font-serif" style="font-size:2.25rem;font-weight:var(--fw-bold);color:#fff" data-count="0">0</div>
            <div style="margin-top:var(--space-2);font-size:0.7rem;color:var(--color-slate-500)">Outbreak zones (7-day window)</div>
          </div>

          <div class="card hover-lift" style="padding:var(--space-6);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-4)">
              <span style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.12em;text-transform:uppercase;color:var(--color-slate-500)">Invasive (30d)</span>
              <span class="material-symbols-outlined" style="color:#2edd82;font-size:1.25rem">insights</span>
            </div>
            <div id="stat-30d" class="font-serif" style="font-size:2.25rem;font-weight:var(--fw-bold);color:#fff" data-count="0">0</div>
            <div style="margin-top:var(--space-2);font-size:0.7rem;color:#ef4444;display:flex;align-items:center;gap:0.25rem">
              <span class="material-symbols-outlined" style="font-size:0.9rem">trending_up</span><span id="stat-invasive-pct">–</span>% invasive
            </div>
          </div>

          <div class="card hover-lift" style="padding:var(--space-6);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-4)">
              <span style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.12em;text-transform:uppercase;color:var(--color-slate-500)">System Risk</span>
              <span class="material-symbols-outlined" style="color:#2edd82;font-size:1.25rem">radar</span>
            </div>
            <div style="display:flex;align-items:center;gap:var(--space-3)">
              <div id="stat-risk" class="font-serif" style="font-size:1.75rem;font-weight:var(--fw-bold);color:#fff">–</div>
              <div id="stat-risk-dot" style="width:0.75rem;height:0.75rem;border-radius:50%;background:#f59e0b"></div>
            </div>
            <div style="margin-top:var(--space-2);font-size:0.7rem;color:var(--color-slate-500)">Current threat level</div>
          </div>

        </div>

        <!-- ── Charts Row ──────────────────────────────────────────────── -->
        <div style="display:grid;grid-template-columns:1fr 2fr;gap:var(--space-6);margin-bottom:var(--space-8)">

          <!-- Donut Chart -->
          <div class="card" style="padding:var(--space-8);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px);display:flex;flex-direction:column;align-items:center">
            <div style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.15em;text-transform:uppercase;color:var(--color-slate-500);margin-bottom:var(--space-8);align-self:flex-start">Classification Ratio</div>
            <div style="position:relative;width:11rem;height:11rem;margin-bottom:var(--space-8)">
              <svg viewBox="0 0 100 100" style="transform:rotate(-90deg);width:100%;height:100%">
                <!-- Background track -->
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(239,68,68,0.15)" stroke-width="14"/>
                <!-- Non-invasive arc (green) -->
                <circle id="donut-green" cx="50" cy="50" r="38" fill="none"
                  stroke="#2edd82" stroke-width="14"
                  stroke-dasharray="238.8" stroke-dashoffset="238.8"
                  style="transition:stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)"/>
                <!-- Invasive arc (red) -->
                <circle id="donut-red" cx="50" cy="50" r="38" fill="none"
                  stroke="#ef4444" stroke-width="14"
                  stroke-dasharray="238.8" stroke-dashoffset="238.8"
                  style="transition:stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s"/>
              </svg>
              <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
                <span id="donut-label-pct" class="font-serif" style="font-size:1.75rem;font-weight:var(--fw-bold);color:#fff">–</span>
                <span style="font-size:0.6rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--color-slate-400)">Invasive</span>
              </div>
            </div>
            <div style="display:flex;gap:var(--space-6);font-size:0.7rem;width:100%;justify-content:center">
              <div style="display:flex;align-items:center;gap:var(--space-2)">
                <span style="width:0.75rem;height:0.75rem;border-radius:2px;background:#ef4444;flex-shrink:0"></span>
                <span style="color:var(--color-slate-400)">Invasive</span>
              </div>
              <div style="display:flex;align-items:center;gap:var(--space-2)">
                <span style="width:0.75rem;height:0.75rem;border-radius:2px;background:#2edd82;flex-shrink:0"></span>
                <span style="color:var(--color-slate-400)">Non-invasive</span>
              </div>
            </div>
          </div>

          <!-- Bar Chart -->
          <div class="card" style="padding:var(--space-8);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-8)">
              <span style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.15em;text-transform:uppercase;color:var(--color-slate-500)">Reports — Last 7 Days</span>
              <span id="bar-total-label" style="font-size:0.7rem;color:#2edd82"></span>
            </div>
            <div id="bar-chart" style="height:10rem;display:flex;align-items:flex-end;gap:var(--space-3);width:100%">
              <!-- Bars injected by JS -->
              ${[0, 1, 2, 3, 4, 5, 6].map(i => `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:var(--space-2)">
                  <div class="bar-track" style="width:100%;position:relative;background:rgba(46,221,130,0.08);border-radius:var(--radius-sm) var(--radius-sm) 0 0;height:9rem;display:flex;align-items:flex-end">
                    <div class="bar-fill-${i}" style="width:100%;height:0%;background:linear-gradient(180deg,#2edd82,#1aab63);border-radius:var(--radius-sm) var(--radius-sm) 0 0;transition:height 1s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms;position:relative">
                      <div class="bar-glow" style="position:absolute;inset:0;border-radius:inherit;box-shadow:0 -4px 12px rgba(46,221,130,0.3)"></div>
                    </div>
                  </div>
                  <span class="bar-day-${i}" style="font-size:0.6rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.08em;color:var(--color-slate-500)">–</span>
                </div>`).join('')}
            </div>
          </div>

        </div>

        <!-- ── Top Species ──────────────────────────────────────────────── -->
        <div class="card" style="padding:var(--space-8);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px);margin-bottom:var(--space-8)">
          <div style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.15em;text-transform:uppercase;color:var(--color-slate-500);margin-bottom:var(--space-8)">Most Reported Invasive Species</div>
          <div id="species-bars" style="display:flex;flex-direction:column;gap:var(--space-5)">
            <div style="color:var(--color-slate-500);font-size:0.85rem">Loading species data…</div>
          </div>
        </div>

        <!-- ── Outbreak Clusters Table ─────────────────────────────────── -->
        <div class="card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);backdrop-filter:blur(12px);border-radius:var(--radius-lg);overflow:hidden">
          <div style="padding:var(--space-6) var(--space-8);border-bottom:1px solid rgba(46,221,130,0.1);display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);letter-spacing:0.15em;text-transform:uppercase;color:var(--color-slate-500)">Recent Outbreak Clusters</span>
            <a href="#/alerts" style="font-size:0.7rem;font-weight:var(--fw-bold);color:#2edd82;display:flex;align-items:center;gap:var(--space-1);text-decoration:none">
              VIEW ALERTS <span class="material-symbols-outlined" style="font-size:0.9rem">arrow_forward</span>
            </a>
          </div>
          <div style="overflow-x:auto">
            <table id="clusters-table" style="width:100%;border-collapse:collapse;font-size:0.8rem">
              <thead>
                <tr style="background:rgba(255,255,255,0.02)">
                  <th style="padding:var(--space-4) var(--space-6);text-align:left;font-size:0.6rem;font-weight:var(--fw-bold);letter-spacing:0.12em;text-transform:uppercase;color:var(--color-slate-500)">Species</th>
                  <th style="padding:var(--space-4) var(--space-6);text-align:left;font-size:0.6rem;font-weight:var(--fw-bold);letter-spacing:0.12em;text-transform:uppercase;color:var(--color-slate-500)">Coordinates</th>
                  <th style="padding:var(--space-4) var(--space-6);text-align:left;font-size:0.6rem;font-weight:var(--fw-bold);letter-spacing:0.12em;text-transform:uppercase;color:var(--color-slate-500)">Reports</th>
                  <th style="padding:var(--space-4) var(--space-6);text-align:left;font-size:0.6rem;font-weight:var(--fw-bold);letter-spacing:0.12em;text-transform:uppercase;color:var(--color-slate-500)">Risk</th>
                  <th style="padding:var(--space-4) var(--space-6);text-align:left;font-size:0.6rem;font-weight:var(--fw-bold);letter-spacing:0.12em;text-transform:uppercase;color:var(--color-slate-500)">Status</th>
                </tr>
              </thead>
              <tbody id="clusters-tbody">
                <tr><td colspan="5" style="padding:var(--space-8);text-align:center;color:var(--color-slate-500)">Loading…</td></tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- Empty state -->
      <div id="stats-empty" style="display:none;padding:var(--space-20);text-align:center;color:var(--color-slate-400)">
        <span class="material-symbols-outlined" style="font-size:3rem;opacity:0.3;display:block;margin-bottom:var(--space-4)">monitoring</span>
        <p style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">No analysed reports yet</p>
        <p style="font-size:0.85rem">Submit a sighting via the <a href="#/report" style="color:#2edd82">Report page</a> to start seeing statistics.</p>
      </div>

    </div>
  </main>
  ${renderFooter()}`,

        async init() {
            initNavbarAuth();

            // Add shimmer keyframe if not already present
            if (!document.getElementById('stats-shimmer-style')) {
                const s = document.createElement('style');
                s.id = 'stats-shimmer-style';
                s.textContent = `@keyframes shimmer{0%{opacity:0.6}50%{opacity:0.3}100%{opacity:0.6}}`;
                document.head.appendChild(s);
            }

            try {
                const token = await getSessionToken();
                const res = await fetch('/api/statistics', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const d = await res.json();

                if (!d.success || d.total_reports === 0) {
                    document.getElementById('stats-skeleton').style.display = 'none';
                    document.getElementById('stats-empty').style.display = 'block';
                    return;
                }

                // ── Show content ────────────────────────────────────────────────
                document.getElementById('stats-skeleton').style.display = 'none';
                document.getElementById('stats-content').style.display = 'block';

                // Metric cards
                document.getElementById('stat-total').textContent = d.total_reports.toLocaleString();
                document.getElementById('stat-clusters').textContent = d.active_clusters;
                document.getElementById('stat-30d').textContent = d.total_reports_30d.toLocaleString();
                document.getElementById('stat-invasive-pct').textContent = d.invasive_pct;

                const riskEl = document.getElementById('stat-risk');
                const riskDot = document.getElementById('stat-risk-dot');
                riskEl.textContent = d.system_risk;
                const riskColors = { Critical: '#ef4444', Elevated: '#f59e0b', Monitoring: '#2edd82' };
                riskDot.style.background = riskColors[d.system_risk] || '#2edd82';
                riskEl.style.color = riskColors[d.system_risk] || '#fff';

                // ── Donut chart ─────────────────────────────────────────────────
                const circ = 2 * Math.PI * 38; // 238.8
                const invasiveFrac = d.invasive_pct / 100;
                const nonInvasiveFrac = 1 - invasiveFrac;

                // Red arc = invasive (starts at top, goes clockwise)
                const redLen = circ * invasiveFrac;
                const redGap = circ - redLen;
                const greenLen = circ * nonInvasiveFrac;
                const greenGap = circ - greenLen;

                // Green arc offset: starts after the red arc
                const greenRotate = invasiveFrac * 360;

                requestAnimationFrame(() => {
                    const donutRed = document.getElementById('donut-red');
                    const donutGreen = document.getElementById('donut-green');

                    donutRed.style.strokeDasharray = `${redLen} ${redGap}`;
                    donutRed.style.strokeDashoffset = '0';

                    donutGreen.style.strokeDasharray = `${greenLen} ${greenGap}`;
                    donutGreen.style.strokeDashoffset = `${-invasiveFrac * circ}`; // rotate green start
                    donutGreen.style.transform = `rotate(${greenRotate}deg)`;
                    donutGreen.style.transformOrigin = '50% 50%';

                    document.getElementById('donut-label-pct').textContent = `${d.invasive_pct}%`;
                });

                // ── Bar chart ───────────────────────────────────────────────────
                const maxCount = Math.max(...d.daily_reports.map(r => r.count), 1);
                const totalWeek = d.daily_reports.reduce((s, r) => s + r.count, 0);
                document.getElementById('bar-total-label').textContent = `${totalWeek} this week`;

                d.daily_reports.forEach((r, i) => {
                    const pct = Math.round((r.count / maxCount) * 100);
                    const fill = document.querySelector(`.bar-fill-${i}`);
                    const dayEl = document.querySelector(`.bar-day-${i}`);
                    if (fill) setTimeout(() => { fill.style.height = pct + '%'; }, 50);
                    if (dayEl) dayEl.textContent = r.day;
                });

                // ── Species bars ────────────────────────────────────────────────
                const speciesCont = document.getElementById('species-bars');
                if (d.top_species.length === 0) {
                    speciesCont.innerHTML = `<p style="color:var(--color-slate-500);font-size:0.85rem">No invasive species identified yet.</p>`;
                } else {
                    speciesCont.innerHTML = d.top_species.map(s => `
            <div>
              <div style="display:flex;justify-content:space-between;font-size:0.72rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:var(--space-2)">
                <span style="color:#e2e8f0;font-style:italic">${s.species}</span>
                <span style="color:#2edd82">${s.count} report${s.count === 1 ? '' : 's'}</span>
              </div>
              <div style="height:4px;width:100%;background:rgba(255,255,255,0.06);border-radius:999px;overflow:hidden">
                <div style="height:100%;width:0%;background:linear-gradient(90deg,#1aab63,#2edd82);border-radius:999px;transition:width 1.2s cubic-bezier(0.4,0,0.2,1)" data-target="${s.pct}"></div>
              </div>
            </div>`).join('');

                    // Animate bars after paint
                    requestAnimationFrame(() => {
                        speciesCont.querySelectorAll('[data-target]').forEach(el => {
                            setTimeout(() => { el.style.width = el.dataset.target + '%'; }, 100);
                        });
                    });
                }

                // ── Clusters table ──────────────────────────────────────────────
                const tbody = document.getElementById('clusters-tbody');
                if (!d.clusters || d.clusters.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" style="padding:var(--space-8);text-align:center;color:var(--color-slate-500);font-size:0.8rem">No active outbreak clusters detected</td></tr>`;
                } else {
                    const levelColor = { critical: '#ef4444', elevated: '#f59e0b', monitoring: '#2edd82' };
                    tbody.innerHTML = d.clusters.map(c => {
                        const col = levelColor[c.level] || '#2edd82';
                        return `
              <tr style="border-top:1px solid rgba(255,255,255,0.04);transition:background 0.15s" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                <td style="padding:var(--space-4) var(--space-6)">
                  <div style="font-weight:var(--fw-bold);color:#fff;font-style:italic">${c.species}</div>
                  <div style="font-size:0.65rem;color:var(--color-slate-500)">${c.count} sightings in 5 km</div>
                </td>
                <td style="padding:var(--space-4) var(--space-6);font-family:monospace;font-size:0.72rem;color:var(--color-slate-400)">${c.lat}, ${c.lon}</td>
                <td style="padding:var(--space-4) var(--space-6);font-weight:var(--fw-bold);color:#fff">${c.count}</td>
                <td style="padding:var(--space-4) var(--space-6)">
                  <div style="display:flex;align-items:center;gap:var(--space-2)">
                    <div style="width:3.5rem;height:3px;background:rgba(255,255,255,0.06);border-radius:999px;overflow:hidden">
                      <div style="height:100%;width:${Math.round(c.avg_risk * 10)}%;background:${col}"></div>
                    </div>
                    <span style="font-size:0.7rem;font-weight:var(--fw-bold);color:${col}">${c.avg_risk}/10</span>
                  </div>
                </td>
                <td style="padding:var(--space-4) var(--space-6)">
                  <span style="display:inline-flex;align-items:center;gap:var(--space-1);font-size:0.65rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.1em;color:${col}">
                    <span style="width:5px;height:5px;border-radius:50%;background:${col}"></span>${c.level}
                  </span>
                </td>
              </tr>`;
                    }).join('');
                }

            } catch (err) {
                console.error('[TerraShield] Statistics load error:', err);
                document.getElementById('stats-skeleton').style.display = 'none';
                document.getElementById('stats-empty').style.display = 'block';
            }
        },
    };
}
