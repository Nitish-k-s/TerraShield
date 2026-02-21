// Report – Submit an Invasive Species Sighting
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

export function renderReport() {
  return `
  ${renderNavbar('report')}
  <main style="padding-top:var(--nav-height)">

    <!-- ═══ HERO SECTION ═══ -->
    <section style="position:relative;overflow:hidden;padding:var(--space-20) 0 var(--space-16);background:linear-gradient(180deg,#060e08 0%,#0a1a0f 40%,#0d2818 100%)">

      <!-- Nature vine ring -->
      <div style="position:absolute;top:50%;left:50%;width:500px;height:500px;transform:translate(-50%,-50%);pointer-events:none;z-index:1;opacity:0.25">
        <svg viewBox="0 0 500 500" width="500" height="500">
          <circle cx="250" cy="250" r="100" fill="none" stroke="rgba(80,140,80,0.4)" stroke-width="2" stroke-dasharray="10,6">
            <animateTransform attributeName="transform" type="rotate" from="0 250 250" to="360 250 250" dur="30s" repeatCount="indefinite"/>
          </circle>
          <circle cx="250" cy="250" r="200" fill="none" stroke="rgba(80,140,80,0.2)" stroke-width="1.5" stroke-dasharray="6,8">
            <animateTransform attributeName="transform" type="rotate" from="360 250 250" to="0 250 250" dur="40s" repeatCount="indefinite"/>
          </circle>
          <text x="250" y="55" font-size="22" text-anchor="middle"><animateTransform attributeName="transform" type="rotate" from="0 250 250" to="360 250 250" dur="30s" repeatCount="indefinite"/>🍃</text>
          <text x="445" y="255" font-size="18" text-anchor="middle"><animateTransform attributeName="transform" type="rotate" from="360 250 250" to="0 250 250" dur="40s" repeatCount="indefinite"/>🌿</text>
        </svg>
      </div>

      <!-- Floating leaf particles -->
      <div id="report-hero-particles" style="position:absolute;inset:0;pointer-events:none;z-index:2"></div>

      <!-- Birds -->
      <svg style="position:absolute;top:12%;left:8%;z-index:6;opacity:0.55;animation:bird-fly 17s ease-in-out infinite" width="60" height="22" viewBox="0 0 50 20">
        <path d="M0,10 Q12,0 25,10 Q38,0 50,10" fill="none" stroke="#3a5a2a" stroke-width="2.5" stroke-linecap="round"><animate attributeName="d" values="M0,10 Q12,0 25,10 Q38,0 50,10;M0,10 Q12,6 25,10 Q38,6 50,10;M0,10 Q12,0 25,10 Q38,0 50,10" dur="0.5s" repeatCount="indefinite"/></path>
      </svg>
      <svg style="position:absolute;top:8%;right:14%;z-index:6;opacity:0.45;animation:bird-fly 21s ease-in-out 3s infinite" width="50" height="18" viewBox="0 0 50 20">
        <path d="M0,10 Q12,0 25,10 Q38,0 50,10" fill="none" stroke="#4a6a3a" stroke-width="2.5" stroke-linecap="round"><animate attributeName="d" values="M0,10 Q12,0 25,10 Q38,0 50,10;M0,10 Q12,6 25,10 Q38,6 50,10;M0,10 Q12,0 25,10 Q38,0 50,10" dur="0.55s" repeatCount="indefinite"/></path>
      </svg>

      <!-- Butterfly -->
      <svg style="position:absolute;top:18%;left:38%;z-index:6;opacity:0.5;animation:bird-fly 22s ease-in-out 2s infinite" width="50" height="40" viewBox="0 0 50 40">
        <ellipse cx="15" cy="16" rx="12" ry="9" fill="#c060a0" opacity="0.8"><animate attributeName="ry" values="9;3;9" dur="0.4s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="35" cy="16" rx="12" ry="9" fill="#c060a0" opacity="0.8"><animate attributeName="ry" values="9;3;9" dur="0.4s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="15" cy="24" rx="8" ry="6" fill="#a04080" opacity="0.6"><animate attributeName="ry" values="6;2;6" dur="0.4s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="35" cy="24" rx="8" ry="6" fill="#a04080" opacity="0.6"><animate attributeName="ry" values="6;2;6" dur="0.4s" repeatCount="indefinite"/></ellipse>
        <line x1="25" y1="8" x2="25" y2="32" stroke="#5a3a4a" stroke-width="1.5"/>
        <circle cx="25" cy="16" r="2" fill="#5a3a4a"/>
      </svg>

      <!-- Large wildflower cluster (left) -->
      <svg style="position:absolute;bottom:15%;left:2%;z-index:6;opacity:0.6;pointer-events:none" width="140" height="110" viewBox="0 0 140 110">
        <line x1="18" y1="110" x2="15" y2="42" stroke="#4a7a3a" stroke-width="2.5"/>
        <line x1="15" y1="62" x2="4" y2="48" stroke="#4a7a3a" stroke-width="1.5"/>
        <circle cx="4" cy="43" r="5" fill="#7ab350" opacity="0.6"/>
        <circle cx="15" cy="32" r="10" fill="#e87ca0" opacity="0.7"/><circle cx="15" cy="32" r="5" fill="#f0c060" opacity="0.8"/>
        <line x1="55" y1="110" x2="58" y2="36" stroke="#4a7a3a" stroke-width="2.5"/>
        <circle cx="58" cy="26" r="12" fill="#c86090" opacity="0.6"/><circle cx="58" cy="26" r="6" fill="#f0c060" opacity="0.7"/>
        <line x1="95" y1="110" x2="92" y2="46" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="92" cy="36" r="9" fill="#e8a040" opacity="0.7"/><circle cx="92" cy="36" r="4.5" fill="#f0d080" opacity="0.8"/>
        <line x1="125" y1="110" x2="122" y2="55" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="122" cy="47" r="7" fill="#d070b0" opacity="0.6"/><circle cx="122" cy="47" r="3.5" fill="#f0b060" opacity="0.7"/>
      </svg>

      <!-- Large wildflower cluster (right) -->
      <svg style="position:absolute;bottom:18%;right:2%;z-index:6;opacity:0.55;pointer-events:none" width="120" height="95" viewBox="0 0 120 95">
        <line x1="18" y1="95" x2="16" y2="36" stroke="#4a7a3a" stroke-width="2.5"/>
        <circle cx="16" cy="26" r="11" fill="#d070b0" opacity="0.7"/><circle cx="16" cy="26" r="5.5" fill="#f0b060" opacity="0.8"/>
        <line x1="55" y1="95" x2="58" y2="30" stroke="#4a7a3a" stroke-width="2.5"/>
        <circle cx="58" cy="20" r="12" fill="#e87ca0" opacity="0.7"/><circle cx="58" cy="20" r="6" fill="#f0c060" opacity="0.8"/>
        <line x1="90" y1="95" x2="88" y2="40" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="88" cy="30" r="9" fill="#e8a040" opacity="0.6"/><circle cx="88" cy="30" r="4.5" fill="#f0d080" opacity="0.8"/>
      </svg>

      <!-- Drifting clouds -->
      <svg style="position:absolute;top:10%;right:-8%;z-index:1;opacity:0.15;animation:drift-left 50s linear infinite" width="140" height="50" viewBox="0 0 160 60">
        <ellipse cx="80" cy="35" rx="65" ry="18" fill="rgba(74,222,128,0.1)" opacity="0.6"/>
        <ellipse cx="110" cy="30" rx="30" ry="12" fill="rgba(74,222,128,0.08)" opacity="0.4"/>
      </svg>
      <svg style="position:absolute;top:18%;left:-6%;z-index:1;opacity:0.1;animation:drift-right 42s linear 3s infinite" width="100" height="40" viewBox="0 0 120 50">
        <ellipse cx="60" cy="28" rx="50" ry="16" fill="rgba(74,222,128,0.08)" opacity="0.5"/>
      </svg>

      <!-- Mountain layers -->
      <svg style="position:absolute;bottom:0;width:100%;z-index:3" preserveAspectRatio="none" viewBox="0 0 1440 200" height="35%">
        <path d="M0,100 C240,140 480,80 720,110 C960,140 1200,90 1440,100 L1440,200 L0,200Z" fill="rgba(10,30,18,0.6)"/>
      </svg>
      <svg style="position:absolute;bottom:0;width:100%;z-index:4" preserveAspectRatio="none" viewBox="0 0 1440 200" height="20%">
        <path d="M0,150 C360,130 720,160 1080,140 C1200,135 1320,145 1440,150 L1440,200 L0,200Z" fill="#0a1a0f"/>
      </svg>

      <!-- Blinking location pins -->
      <div class="alert-dot" style="top:30%;left:22%;animation-delay:0s;opacity:0.4;background:#22c55e"></div>
      <div class="alert-dot" style="top:50%;right:28%;animation-delay:1s;opacity:0.3;background:#22c55e"></div>
      <div class="alert-dot" style="top:40%;left:60%;animation-delay:0.5s;opacity:0.35;background:var(--color-primary)"></div>

      <!-- Content -->
      <div class="container" style="position:relative;z-index:10;text-align:center">
        <div class="hero-animate" style="margin-bottom:var(--space-4)">
          <span style="font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;padding:var(--space-2) var(--space-4);background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.15);border-radius:var(--radius-full);color:#16a34a;font-weight:var(--fw-bold);display:inline-flex;align-items:center;gap:var(--space-2)">
            <span class="material-symbols-outlined" style="font-size:0.875rem">add_a_photo</span>
            Citizen Science Network
          </span>
        </div>
        <h1 class="font-serif hero-animate" style="font-size:clamp(2rem,5vw,3rem);font-weight:var(--fw-bold);color:var(--color-slate-900);margin-bottom:var(--space-4)">Report a Sighting</h1>
        <p class="hero-animate-delay" style="color:var(--color-slate-600);max-width:38rem;margin:0 auto;line-height:1.8">Help protect ecosystems by submitting geo-tagged species observations. Your field report feeds directly into TerraShield's AI detection pipeline.</p>
      </div>
    </section>

    <!-- ═══ REPORT FORM ═══ -->
    <section class="section" style="background:#0a1a0f;padding:var(--space-16) 0">
      <div class="container" style="max-width:48rem">
        <div class="reveal" style="background:rgba(20,40,25,0.7);border-radius:var(--radius-xl);box-shadow:0 4px 24px rgba(0,0,0,0.3);border:1px solid rgba(74,222,128,0.1);overflow:hidden;backdrop-filter:blur(8px)">

          <!-- Form header -->
          <div style="background:linear-gradient(135deg,rgba(74,222,128,0.06),rgba(34,197,94,0.04));padding:var(--space-8);border-bottom:1px solid rgba(74,222,128,0.1)">
            <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-2)">
              <div style="width:2.5rem;height:2.5rem;border-radius:var(--radius-lg);background:rgba(74,222,128,0.1);display:flex;align-items:center;justify-content:center">
                <span class="material-symbols-outlined" style="color:var(--color-primary)">edit_note</span>
              </div>
              <h2 style="font-weight:var(--fw-bold);font-size:1.25rem">New Field Report</h2>
            </div>
            <p style="color:var(--color-slate-500);font-size:0.8125rem;line-height:1.6">Complete the form below with as much detail as possible. Photos significantly improve AI classification accuracy.</p>
          </div>

          <!-- Form body -->
          <div style="padding:var(--space-8)">
            <form id="report-form" style="display:flex;flex-direction:column;gap:var(--space-6)">

              <!-- Species info row -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5)">
                <div class="form-group">
                  <label class="form-label">Species Name</label>
                  <div class="form-input-icon">
                    <span class="material-symbols-outlined">eco</span>
                    <input class="form-input" type="text" placeholder="e.g. Japanese Knotweed" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <select class="form-input" required>
                    <option value="">Select category...</option>
                    <option>Plant – Terrestrial</option>
                    <option>Plant – Aquatic</option>
                    <option>Insect</option>
                    <option>Fish / Marine Life</option>
                    <option>Mammal</option>
                    <option>Bird</option>
                    <option>Reptile / Amphibian</option>
                    <option>Fungus / Pathogen</option>
                    <option>Unknown – Need ID</option>
                  </select>
                </div>
              </div>

              <!-- Location row -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5)">
                <div class="form-group">
                  <label class="form-label">Location</label>
                  <div class="form-input-icon">
                    <span class="material-symbols-outlined">location_on</span>
                    <input class="form-input" type="text" placeholder="GPS or address" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Date Observed</label>
                  <div class="form-input-icon">
                    <span class="material-symbols-outlined">calendar_today</span>
                    <input class="form-input" type="date" required>
                  </div>
                </div>
              </div>

              <!-- Severity & Population -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5)">
                <div class="form-group">
                  <label class="form-label">Severity Estimate</label>
                  <select class="form-input">
                    <option value="">Assess the threat...</option>
                    <option>Low – Single specimen</option>
                    <option>Medium – Small cluster</option>
                    <option>High – Large established colony</option>
                    <option>Critical – Rapid spread observed</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Estimated Count</label>
                  <div class="form-input-icon">
                    <span class="material-symbols-outlined">tag</span>
                    <input class="form-input" type="number" placeholder="Approx. number" min="1">
                  </div>
                </div>
              </div>

              <!-- Photo upload -->
              <div class="form-group">
                <label class="form-label">Photos</label>
                <div style="border:2px dashed var(--color-slate-200);border-radius:var(--radius-lg);padding:var(--space-8);text-align:center;transition:border-color 0.2s,background 0.2s;cursor:pointer" onmouseover="this.style.borderColor='var(--color-primary)';this.style.background='rgba(29,172,201,0.02)'" onmouseout="this.style.borderColor='var(--color-slate-200)';this.style.background='transparent'">
                  <span class="material-symbols-outlined" style="font-size:2rem;color:var(--color-slate-300);margin-bottom:var(--space-2);display:block">cloud_upload</span>
                  <p style="font-weight:var(--fw-bold);color:var(--color-slate-700);margin-bottom:var(--space-1)">Drop images here or click to browse</p>
                  <p style="font-size:0.75rem;color:var(--color-slate-400)">JPG, PNG up to 10MB · Multiple photos supported</p>
                  <input type="file" accept="image/*" multiple style="display:none">
                </div>
              </div>

              <!-- Notes -->
              <div class="form-group">
                <label class="form-label">Field Notes</label>
                <textarea class="form-input" rows="4" placeholder="Describe the habitat, surrounding vegetation, proximity to water, spread pattern…" style="resize:vertical"></textarea>
              </div>

              <!-- Submit -->
              <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--color-slate-200)">
                <p style="font-size:0.75rem;color:var(--color-slate-400);display:flex;align-items:center;gap:var(--space-2)">
                  <span class="material-symbols-outlined" style="font-size:0.875rem">verified_user</span>
                  Reports are reviewed by AI before publication
                </p>
                <button type="submit" class="btn btn-primary" style="padding:var(--space-3) var(--space-8)">
                  <span class="material-symbols-outlined" style="font-size:1rem">send</span>
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ IMPACT SECTION ═══ -->
    <section class="section" style="background:var(--color-bg-light);padding:var(--space-20) 0;position:relative;overflow:hidden">
      <!-- Decorative grid -->
      <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(45,90,76,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(45,90,76,0.02) 1px,transparent 1px);background-size:80px 80px;pointer-events:none"></div>

      <div class="container" style="position:relative;z-index:2">
        <div class="section-header reveal" style="margin-bottom:var(--space-16)">
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-3);display:inline-block">Your Impact</span>
          <h2 class="section-title">Every Report Matters</h2>
          <div class="section-divider"></div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-6)">
          <div class="card hover-lift reveal" data-delay="0" style="padding:var(--space-8);text-align:center">
            <span class="material-symbols-outlined" style="font-size:2.5rem;color:var(--color-primary);margin-bottom:var(--space-3);display:block">radar</span>
            <span style="font-size:2rem;font-weight:var(--fw-bold);display:block;margin-bottom:var(--space-1)" class="counter" data-target="2847">0</span>
            <span style="font-size:0.65rem;color:var(--color-slate-500);text-transform:uppercase;letter-spacing:0.08em;font-weight:var(--fw-bold)">Reports Filed</span>
          </div>
          <div class="card hover-lift reveal" data-delay="100" style="padding:var(--space-8);text-align:center">
            <span class="material-symbols-outlined" style="font-size:2.5rem;color:#f59e0b;margin-bottom:var(--space-3);display:block">warning</span>
            <span style="font-size:2rem;font-weight:var(--fw-bold);display:block;margin-bottom:var(--space-1)" class="counter" data-target="186">0</span>
            <span style="font-size:0.65rem;color:var(--color-slate-500);text-transform:uppercase;letter-spacing:0.08em;font-weight:var(--fw-bold)">Outbreaks Flagged</span>
          </div>
          <div class="card hover-lift reveal" data-delay="200" style="padding:var(--space-8);text-align:center">
            <span class="material-symbols-outlined" style="font-size:2.5rem;color:#22c55e;margin-bottom:var(--space-3);display:block">public</span>
            <span style="font-size:2rem;font-weight:var(--fw-bold);display:block;margin-bottom:var(--space-1)" class="counter" data-target="24">0</span>
            <span style="font-size:0.65rem;color:var(--color-slate-500);text-transform:uppercase;letter-spacing:0.08em;font-weight:var(--fw-bold)">Countries Active</span>
          </div>
          <div class="card hover-lift reveal" data-delay="300" style="padding:var(--space-8);text-align:center">
            <span class="material-symbols-outlined" style="font-size:2.5rem;color:#ef4444;margin-bottom:var(--space-3);display:block">eco</span>
            <span style="font-size:2rem;font-weight:var(--fw-bold);display:block;margin-bottom:var(--space-1)" class="counter" data-target="142">0</span>
            <span style="font-size:0.65rem;color:var(--color-slate-500);text-transform:uppercase;letter-spacing:0.08em;font-weight:var(--fw-bold)">Species Tracked</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ GUIDELINES ═══ -->
    <section class="section" style="background:#fff;padding:var(--space-16) 0;border-top:1px solid var(--color-slate-200)">
      <div class="container">
        <div class="section-header reveal" style="margin-bottom:var(--space-12)">
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-3);display:inline-block">Field Guide</span>
          <h2 class="section-title">Reporting Best Practices</h2>
          <div class="section-divider"></div>
        </div>

        <div class="three-col-grid">
          <div class="card hover-lift reveal" data-delay="0" style="padding:var(--space-8) var(--space-6)">
            <div style="width:3rem;height:3rem;border-radius:var(--radius-lg);background:rgba(29,172,201,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary)">photo_camera</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Clear Photos</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.7">Capture multiple angles — leaves, stems, flowers, and the overall habitat. Good photos increase AI confidence from 60% to 94%.</p>
          </div>
          <div class="card hover-lift reveal" data-delay="100" style="padding:var(--space-8) var(--space-6)">
            <div style="width:3rem;height:3rem;border-radius:var(--radius-lg);background:rgba(29,172,201,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary)">my_location</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Precise Location</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.7">Enable GPS on your device. Accurate coordinates help our satellite cross-reference system validate sightings faster.</p>
          </div>
          <div class="card hover-lift reveal" data-delay="200" style="padding:var(--space-8) var(--space-6)">
            <div style="width:3rem;height:3rem;border-radius:var(--radius-lg);background:rgba(29,172,201,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary)">description</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Detailed Notes</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.7">Note the habitat type, water proximity, spread area, and any identifiers. Context helps researchers assess severity accurately.</p>
          </div>
        </div>
      </div>
    </section>

  </main>
  ${renderFooter()}`;
}
