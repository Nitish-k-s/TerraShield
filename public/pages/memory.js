// Agent Memory Page — shows all past reports + how the agent learned from them
import { renderNavbar, initNavbarAuth } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { getUser, getSessionToken } from '../utils/auth.js';

const RISK_COLOR = { 'invasive-plant': '#ef4444', 'invasive-animal': '#f97316', 'deforestation': '#a855f7', 'wildfire': '#f59e0b', 'flood-risk': '#3b82f6', 'urban-encroachment': '#ec4899', 'normal-terrain': '#22c55e', 'unknown': '#6b7280' };
const RISK_LABEL = { 'invasive-plant': '🌿 Invasive Plant', 'invasive-animal': '🦎 Invasive Animal', 'deforestation': '🪵 Deforestation', 'wildfire': '🔥 Wildfire', 'flood-risk': '🌊 Flood Risk', 'urban-encroachment': '🏗️ Urban Encroachment', 'normal-terrain': '✅ Normal Terrain', 'unknown': '❓ Unknown' };

export function renderMemory() {
  return {
    html: `
  ${renderNavbar('memory')}
  <main style="padding-top:var(--nav-height);min-height:100vh;background:linear-gradient(160deg,#03140c 0%,#051a0f 50%,#03140c 100%)">

    <!-- Hero -->
    <section style="padding:var(--space-14) 0 var(--space-8);position:relative;overflow:hidden">
      <div style="position:absolute;top:-80px;left:10%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(74,222,128,0.06) 0%,transparent 70%);pointer-events:none;filter:blur(60px)"></div>
      <div class="container" style="position:relative;z-index:2">
        <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-4)">
          <div style="width:3.5rem;height:3.5rem;border-radius:50%;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);display:flex;align-items:center;justify-content:center;font-size:1.75rem">🧠</div>
          <div>
            <div style="display:inline-flex;align-items:center;gap:var(--space-2);padding:0.2rem 0.75rem;border-radius:999px;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);margin-bottom:var(--space-2)">
              <span style="width:6px;height:6px;border-radius:50%;background:#4ade80;animation:pulse-glow 2s infinite"></span>
              <span style="font-size:0.65rem;font-weight:bold;color:#4ade80;text-transform:uppercase;letter-spacing:0.12em">Hindsight-Powered Agent Memory</span>
            </div>
            <h1 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:bold;color:#fff;margin:0">Agent Memory Timeline</h1>
          </div>
        </div>
        <p style="color:var(--color-slate-400);max-width:42rem;line-height:1.7;margin-bottom:var(--space-6)">Every report you submit is retained in the agent's memory. When you analyse a new image, the agent recalls past sightings nearby and injects that context into Gemini — making each analysis smarter than the last.</p>

        <!-- Stats bar -->
        <div id="memory-stats-bar" style="display:flex;flex-wrap:wrap;gap:var(--space-4);margin-bottom:var(--space-8)">
          <div style="padding:var(--space-4) var(--space-5);background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.15);border-radius:var(--radius-lg);min-width:120px">
            <div id="stat-reports" style="font-size:1.75rem;font-weight:bold;color:#4ade80;font-family:monospace">—</div>
            <div style="font-size:0.7rem;color:var(--color-slate-500);text-transform:uppercase;letter-spacing:0.08em">Your Reports</div>
          </div>
          <div style="padding:var(--space-4) var(--space-5);background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.15);border-radius:var(--radius-lg);min-width:120px">
            <div id="stat-memories" style="font-size:1.75rem;font-weight:bold;color:#4ade80;font-family:monospace">—</div>
            <div style="font-size:0.7rem;color:var(--color-slate-500);text-transform:uppercase;letter-spacing:0.08em">Total Memories</div>
          </div>
          <div style="padding:var(--space-4) var(--space-5);background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.15);border-radius:var(--radius-lg);min-width:120px">
            <div id="stat-recalls" style="font-size:1.75rem;font-weight:bold;color:#4ade80;font-family:monospace">—</div>
            <div style="font-size:0.7rem;color:var(--color-slate-500);text-transform:uppercase;letter-spacing:0.08em">With Recalls</div>
          </div>
        </div>

        <!-- How it works strip -->
        <div style="padding:var(--space-4) var(--space-6);background:rgba(74,222,128,0.04);border:1px solid rgba(74,222,128,0.12);border-radius:var(--radius-xl);display:flex;align-items:center;gap:var(--space-6);flex-wrap:wrap;margin-bottom:var(--space-8)">
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <span style="font-size:1.25rem">📸</span>
            <div>
              <div style="font-size:0.75rem;font-weight:bold;color:#fff">You Submit</div>
              <div style="font-size:0.7rem;color:var(--color-slate-500)">Geo-tagged photo</div>
            </div>
          </div>
          <div style="color:rgba(74,222,128,0.4);font-size:1.25rem">→</div>
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <span style="font-size:1.25rem">🧠</span>
            <div>
              <div style="font-size:0.75rem;font-weight:bold;color:#fff">Agent Recalls</div>
              <div style="font-size:0.7rem;color:var(--color-slate-500)">Past sightings nearby</div>
            </div>
          </div>
          <div style="color:rgba(74,222,128,0.4);font-size:1.25rem">→</div>
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <span style="font-size:1.25rem">⚡</span>
            <div>
              <div style="font-size:0.75rem;font-weight:bold;color:#fff">Hindsight Summarizes</div>
              <div style="font-size:0.7rem;color:var(--color-slate-500)">2-sentence context</div>
            </div>
          </div>
          <div style="color:rgba(74,222,128,0.4);font-size:1.25rem">→</div>
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <span style="font-size:1.25rem">🤖</span>
            <div>
              <div style="font-size:0.75rem;font-weight:bold;color:#fff">Gemini Analyses</div>
              <div style="font-size:0.7rem;color:var(--color-slate-500)">With full context</div>
            </div>
          </div>
          <div style="color:rgba(74,222,128,0.4);font-size:1.25rem">→</div>
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <span style="font-size:1.25rem">💾</span>
            <div>
              <div style="font-size:0.75rem;font-weight:bold;color:#fff">Retained</div>
              <div style="font-size:0.7rem;color:var(--color-slate-500)">Memory grows</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section style="padding:0 0 var(--space-20)">
      <div class="container">

        <!-- Loading -->
        <div id="memory-loading" style="text-align:center;padding:var(--space-16);color:var(--color-slate-500)">
          <div style="font-size:2.5rem;margin-bottom:var(--space-4);animation:pulse-glow 1.5s infinite">🧠</div>
          <p>Loading your memory timeline...</p>
        </div>

        <!-- Empty -->
        <div id="memory-empty" style="display:none;text-align:center;padding:var(--space-16);color:var(--color-slate-500)">
          <div style="font-size:3rem;margin-bottom:var(--space-4);opacity:0.4">🧠</div>
          <p style="font-weight:bold;margin-bottom:var(--space-2)">No memories yet</p>
          <p style="font-size:0.875rem">Submit and analyse a report to start building agent memory.</p>
          <a href="#/report" class="btn btn-primary" style="margin-top:var(--space-6);display:inline-flex">Submit a Report</a>
        </div>

        <!-- Timeline list -->
        <div id="memory-timeline" style="display:none;position:relative">
          <!-- Vertical line -->
          <div style="position:absolute;left:1.75rem;top:0;bottom:0;width:2px;background:linear-gradient(180deg,rgba(74,222,128,0.4),rgba(74,222,128,0.05));border-radius:2px"></div>
          <div id="memory-cards"></div>
        </div>

      </div>
    </section>
  </main>
  ${renderFooter()}`,

    async init() {
      initNavbarAuth();

      const user = getUser();
      if (!user) { window.location.hash = '#/login'; return; }

      const token = getSessionToken();

      try {
        const res = await fetch('/api/agent-memory/user', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();

        document.getElementById('memory-loading').style.display = 'none';

        if (!data.success || !data.reports?.length) {
          document.getElementById('memory-empty').style.display = 'block';
          return;
        }

        const reports = data.reports;
        const withRecalls = reports.filter(r => r.memoryCount > 0).length;

        document.getElementById('stat-reports').textContent = reports.length;
        document.getElementById('stat-memories').textContent = data.totalMemories;
        document.getElementById('stat-recalls').textContent = withRecalls;

        document.getElementById('memory-timeline').style.display = 'block';

        const container = document.getElementById('memory-cards');
        container.innerHTML = reports.map((r, idx) => {
          const color = RISK_COLOR[r.ai_label] || '#6b7280';
          const label = RISK_LABEL[r.ai_label] || r.ai_label;
          const tags = Array.isArray(r.ai_tags) ? r.ai_tags : [];
          const date = new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          const time = new Date(r.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          const hasMemory = r.memoryCount > 0;
          const riskScore = r.ai_risk_score ?? 0;
          const riskBar = Math.round(riskScore * 10);

          return `
            <div style="display:flex;gap:var(--space-5);margin-bottom:var(--space-6);padding-left:var(--space-2);animation:fadeInUp 0.4s ease-out ${idx * 0.06}s both">
              <!-- Timeline dot -->
              <div style="flex-shrink:0;width:2.25rem;height:2.25rem;border-radius:50%;background:${hasMemory ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)'};border:2px solid ${hasMemory ? '#4ade80' : 'rgba(255,255,255,0.1)'};display:flex;align-items:center;justify-content:center;font-size:0.9rem;position:relative;z-index:1;margin-top:4px;${hasMemory ? 'box-shadow:0 0 12px rgba(74,222,128,0.3)' : ''}">
                ${hasMemory ? '🧠' : '📍'}
              </div>

              <!-- Card -->
              <div style="flex:1;background:rgba(255,255,255,0.03);border:1px solid ${hasMemory ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.07)'};border-radius:var(--radius-xl);overflow:hidden;transition:all 0.3s ease" onmouseover="this.style.borderColor='rgba(74,222,128,0.3)';this.style.transform='translateX(4px)'" onmouseout="this.style.borderColor='${hasMemory ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.07)'}';this.style.transform='translateX(0)'">

                <!-- Card header -->
                <div style="padding:var(--space-4) var(--space-5);border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3)">
                  <div style="display:flex;align-items:center;gap:var(--space-3)">
                    <span style="padding:0.2rem 0.6rem;border-radius:999px;font-size:0.7rem;font-weight:bold;background:${color}22;color:${color};border:1px solid ${color}44">${label}</span>
                    ${hasMemory ? `<span style="padding:0.2rem 0.6rem;border-radius:999px;font-size:0.65rem;font-weight:bold;background:rgba(74,222,128,0.1);color:#4ade80;border:1px solid rgba(74,222,128,0.3)">🧠 ${r.memoryCount} memories recalled</span>` : '<span style="font-size:0.7rem;color:var(--color-slate-600)">First sighting in area</span>'}
                  </div>
                  <div style="font-size:0.72rem;color:var(--color-slate-500)">${date} · ${time}</div>
                </div>

                <!-- Card body -->
                <div style="padding:var(--space-4) var(--space-5)">
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4)">

                    <!-- Left: report info -->
                    <div>
                      <div style="font-size:0.7rem;color:var(--color-slate-500);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:var(--space-2)">Report Details</div>
                      <div style="font-size:0.85rem;color:#fff;margin-bottom:var(--space-1)">${r.filename}</div>
                      ${r.district ? `<div style="font-size:0.78rem;color:var(--color-slate-400)">📍 ${r.district}${r.state ? ', ' + r.state : ''}</div>` : ''}
                      ${r.latitude ? `<div style="font-size:0.72rem;color:var(--color-slate-500);margin-top:2px">${r.latitude.toFixed(4)}°, ${r.longitude.toFixed(4)}°</div>` : ''}
                      ${tags.length ? `<div style="margin-top:var(--space-2);display:flex;flex-wrap:wrap;gap:4px">${tags.slice(0,3).map(t => `<span style="font-size:0.65rem;padding:2px 6px;background:rgba(255,255,255,0.05);border-radius:4px;color:var(--color-slate-400)">${t}</span>`).join('')}</div>` : ''}
                    </div>

                    <!-- Right: risk score -->
                    <div>
                      <div style="font-size:0.7rem;color:var(--color-slate-500);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:var(--space-2)">Risk Score</div>
                      <div style="font-size:1.75rem;font-weight:bold;color:${color};font-family:monospace;line-height:1">${riskScore.toFixed(1)}<span style="font-size:0.9rem;color:var(--color-slate-500)">/10</span></div>
                      <div style="margin-top:var(--space-2);height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden">
                        <div style="height:100%;width:${riskBar}%;background:${color};border-radius:3px;transition:width 1s ease"></div>
                      </div>
                      <div style="font-size:0.72rem;color:var(--color-slate-500);margin-top:4px">Confidence: ${Math.round((r.ai_confidence ?? 0) * 100)}%</div>
                    </div>
                  </div>

                  <!-- AI Summary -->
                  ${r.ai_summary ? `
                  <div style="padding:var(--space-3) var(--space-4);background:rgba(74,222,128,0.04);border-left:2px solid rgba(74,222,128,0.3);border-radius:0 var(--radius) var(--radius) 0;margin-bottom:var(--space-4)">
                    <div style="font-size:0.65rem;font-weight:bold;color:#4ade80;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Gemini Assessment</div>
                    <p style="font-size:0.82rem;color:#a8d5b0;margin:0;line-height:1.6">${r.ai_summary}</p>
                  </div>` : ''}

                  <!-- Memory recalls -->
                  ${hasMemory ? `
                  <div style="background:rgba(74,222,128,0.05);border:1px solid rgba(74,222,128,0.15);border-radius:var(--radius-lg);padding:var(--space-3) var(--space-4)">
                    <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3)">
                      <span style="font-size:1rem">🧠</span>
                      <span style="font-size:0.7rem;font-weight:bold;color:#4ade80;text-transform:uppercase;letter-spacing:0.08em">Agent recalled these past sightings</span>
                      <span style="font-size:0.65rem;padding:1px 6px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.2);border-radius:999px;color:#4ade80">⚡ Hindsight Enhanced</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:var(--space-2)">
                      ${r.nearbyMemories.map(m => `
                        <div style="display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-2) var(--space-3);background:rgba(0,0,0,0.2);border-radius:var(--radius);border:1px solid rgba(74,222,128,0.08)">
                          <span style="font-size:0.8rem;margin-top:1px">📌</span>
                          <div style="flex:1">
                            <div style="font-size:0.75rem;color:#a8d5b0;line-height:1.5">${m.content}</div>
                            <div style="font-size:0.65rem;color:var(--color-slate-600);margin-top:2px">${new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>` : `
                  <div style="padding:var(--space-3) var(--space-4);background:rgba(255,255,255,0.02);border:1px dashed rgba(255,255,255,0.08);border-radius:var(--radius-lg);text-align:center">
                    <span style="font-size:0.78rem;color:var(--color-slate-600)">🔍 No prior memories recalled — this was the first sighting in this area. It has now been retained for future analyses.</span>
                  </div>`}
                </div>
              </div>
            </div>
          `;
        }).join('');

        // Add fadeInUp animation
        if (!document.getElementById('memory-anim-style')) {
          const s = document.createElement('style');
          s.id = 'memory-anim-style';
          s.textContent = `@keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`;
          document.head.appendChild(s);
        }

      } catch (err) {
        document.getElementById('memory-loading').innerHTML = `<p style="color:#ef4444">Failed to load memory timeline. Please refresh.</p>`;
      }
    }
  };
}
