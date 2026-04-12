// API Dashboard — shows user's active API keys
import { renderNavbar, initNavbarAuth } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { getUser, getSessionToken } from '../utils/auth.js';

export function renderApiDashboard() {
  return {
    html: `
  ${renderNavbar('api')}
  <main style="padding-top:var(--nav-height);min-height:100vh;background:linear-gradient(160deg,#03140c 0%,#051a0f 50%,#03140c 100%)">

    <section style="padding:var(--space-14) 0 var(--space-20)">
      <div class="container" style="max-width:860px">

        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-4);margin-bottom:var(--space-10)">
          <div>
            <div style="display:inline-flex;align-items:center;gap:var(--space-2);padding:0.2rem 0.75rem;border-radius:999px;background:rgba(0,255,150,0.08);border:1px solid rgba(0,255,150,0.2);margin-bottom:var(--space-3)">
              <span style="width:6px;height:6px;border-radius:50%;background:#00ff9d;animation:pulse-glow 2s infinite"></span>
              <span style="font-size:0.65rem;font-weight:bold;color:#00ff9d;text-transform:uppercase;letter-spacing:0.12em">Enterprise API</span>
            </div>
            <h1 style="font-size:clamp(1.75rem,4vw,2.25rem);font-weight:bold;color:#fff;margin:0">My API Keys</h1>
            <p style="color:var(--color-slate-400);margin-top:var(--space-2);font-size:0.9rem">Manage your TerraShield API access credentials</p>
          </div>
          <a href="#/enterprise/register" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:var(--space-2);background:linear-gradient(90deg,#00c97b,#00ff9d);color:#002b1f;border:none;font-weight:bold">
            <span class="material-symbols-outlined" style="font-size:1.1rem">add</span> Generate New Key
          </a>
        </div>

        <!-- Loading -->
        <div id="keys-loading" style="text-align:center;padding:var(--space-16);color:var(--color-slate-500)">
          <span class="material-symbols-outlined" style="font-size:2rem;animation:pulse-glow 1.5s infinite;color:#00ff9d">key</span>
          <p style="margin-top:var(--space-3)">Loading your API keys...</p>
        </div>

        <!-- Empty -->
        <div id="keys-empty" style="display:none;text-align:center;padding:var(--space-16);color:var(--color-slate-500)">
          <span class="material-symbols-outlined" style="font-size:3rem;opacity:0.3;display:block;margin-bottom:var(--space-4)">key_off</span>
          <p style="font-weight:bold;margin-bottom:var(--space-2)">No API keys yet</p>
          <p style="font-size:0.875rem;margin-bottom:var(--space-6)">Generate a key to start using the TerraShield API.</p>
          <a href="#/enterprise/register" class="btn btn-primary" style="background:linear-gradient(90deg,#00c97b,#00ff9d);color:#002b1f;border:none;font-weight:bold">Get API Access</a>
        </div>

        <!-- Keys list -->
        <div id="keys-list" style="display:none;flex-direction:column;gap:var(--space-5)"></div>

        <!-- API Reference -->
        <div id="api-reference" style="display:none;margin-top:var(--space-10);padding:var(--space-6);background:rgba(0,255,150,0.03);border:1px solid rgba(0,255,150,0.12);border-radius:var(--radius-xl)">
          <h2 style="font-size:1.1rem;font-weight:bold;color:#fff;margin-bottom:var(--space-5);display:flex;align-items:center;gap:var(--space-2)">
            <span class="material-symbols-outlined" style="color:#00ff9d;font-size:1.2rem">code</span> Quick Reference
          </h2>
          <div style="display:flex;flex-direction:column;gap:var(--space-4)">
            ${[
              { method: 'GET', path: '/api/v1/reports', desc: 'Invasive species sightings — last 30 days' },
              { method: 'GET', path: '/api/v1/statistics', desc: 'District-level outbreak analytics' },
              { method: 'GET', path: '/api/v1/satellite?lat=&lng=', desc: 'Satellite NDVI for any GPS coordinate' },
            ].map(e => `
              <div style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-3) var(--space-4);background:rgba(0,0,0,0.3);border-radius:var(--radius-lg);flex-wrap:wrap">
                <span style="font-size:0.7rem;font-weight:bold;padding:2px 8px;background:rgba(0,255,150,0.1);border:1px solid rgba(0,255,150,0.2);border-radius:4px;color:#00ff9d;font-family:monospace">${e.method}</span>
                <code style="font-size:0.82rem;color:#a8d5b0;flex:1">${e.path}</code>
                <span style="font-size:0.78rem;color:var(--color-slate-500)">${e.desc}</span>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:var(--space-5);padding:var(--space-4);background:rgba(0,0,0,0.4);border-radius:var(--radius-lg)">
            <div style="font-size:0.7rem;color:var(--color-slate-500);margin-bottom:var(--space-2)">Example request</div>
            <pre id="example-curl" style="font-size:0.78rem;color:#a8d5b0;margin:0;overflow-x:auto">curl https://terrashield.app/api/v1/reports \
  -H "Authorization: Bearer YOUR_KEY"</pre>
          </div>
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
        const res = await fetch('/api/enterprise/my-keys', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();

        document.getElementById('keys-loading').style.display = 'none';

        if (!data.success || !data.keys?.length) {
          document.getElementById('keys-empty').style.display = 'block';
          return;
        }

        const list = document.getElementById('keys-list');
        list.style.display = 'flex';
        document.getElementById('api-reference').style.display = 'block';

        list.innerHTML = data.keys.map(k => {
          const date = new Date(k.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          const typeColors = { government: '#3b82f6', ngo: '#22c55e', research: '#a855f7', private: '#f59e0b', agency: '#06b6d4' };
          const color = typeColors[k.org_type] || '#6b7280';

          return `
            <div style="background:rgba(0,40,30,0.5);border:1px solid rgba(0,255,150,0.12);border-radius:var(--radius-xl);padding:var(--space-6);transition:border-color 0.2s" onmouseover="this.style.borderColor='rgba(0,255,150,0.25)'" onmouseout="this.style.borderColor='rgba(0,255,150,0.12)'">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3);margin-bottom:var(--space-4)">
                <div>
                  <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-2)">
                    <span style="font-size:1rem;font-weight:bold;color:#fff">${k.org_name}</span>
                    <span style="font-size:0.65rem;padding:2px 8px;border-radius:999px;background:${color}22;color:${color};border:1px solid ${color}44;font-weight:bold;text-transform:uppercase">${k.org_type}</span>
                    ${k.sandbox ? '<span style="font-size:0.65rem;padding:2px 8px;border-radius:999px;background:rgba(245,158,11,0.1);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);font-weight:bold">SANDBOX</span>' : ''}
                  </div>
                  <div style="font-size:0.78rem;color:var(--color-slate-500)">${k.email} · ${k.country} · Created ${date}</div>
                </div>
                <button onclick="deleteKey(${k.id}, this)" style="padding:0.35rem 0.75rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:var(--radius);color:#ef4444;font-size:0.72rem;font-weight:bold;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.1)'">
                  Revoke
                </button>
              </div>

              <!-- Key prefix -->
              <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);background:rgba(0,0,0,0.4);border-radius:var(--radius-lg);margin-bottom:var(--space-4)">
                <span class="material-symbols-outlined" style="font-size:1rem;color:#00ff9d">key</span>
                <code style="font-size:0.85rem;color:#a8d5b0;font-family:monospace;flex:1">${k.key_prefix}<span style="color:var(--color-slate-600)">••••••••••••••••••••••••••••••</span></code>
                <span style="font-size:0.65rem;color:var(--color-slate-600)">Key hidden for security</span>
              </div>

              ${k.use_case ? `<div style="font-size:0.78rem;color:var(--color-slate-500);margin-bottom:var(--space-3)">Use case: ${k.use_case}</div>` : ''}

              <!-- Quick copy curl -->
              <div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap">
                <span style="font-size:0.72rem;color:var(--color-slate-500)">Lost your key?</span>
                <a href="#/enterprise/register" style="font-size:0.72rem;color:#00ff9d;font-weight:bold">Generate a new one →</a>
                <span style="font-size:0.72rem;color:var(--color-slate-600)">|</span>
                <span style="font-size:0.72rem;color:var(--color-slate-500)">Volume: ${k.volume}</span>
              </div>
            </div>
          `;
        }).join('');

        // Update example curl with first key prefix
        document.getElementById('example-curl').textContent =
          `curl https://terrashield.app/api/v1/reports \\\n  -H "Authorization: Bearer ${data.keys[0].key_prefix}..."`;

        // Delete handler
        window.deleteKey = async (id, btn) => {
          if (!confirm('Revoke this API key? This cannot be undone.')) return;
          btn.textContent = 'Revoking...';
          btn.disabled = true;
          const r = await fetch('/api/enterprise/my-keys', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
            body: JSON.stringify({ id })
          });
          if (r.ok) {
            btn.closest('div[style*="border-radius:var(--radius-xl)"]').remove();
            if (!document.querySelector('#keys-list > div')) {
              list.style.display = 'none';
              document.getElementById('api-reference').style.display = 'none';
              document.getElementById('keys-empty').style.display = 'block';
            }
          } else {
            btn.textContent = 'Error';
            setTimeout(() => { btn.textContent = 'Revoke'; btn.disabled = false; }, 2000);
          }
        };

      } catch (err) {
        document.getElementById('keys-loading').innerHTML = `<p style="color:#ef4444">Failed to load keys. Please refresh.</p>`;
      }
    }
  };
}
