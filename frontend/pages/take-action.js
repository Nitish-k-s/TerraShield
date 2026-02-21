// Report – Submit an Invasive Species Sighting
import { renderNavbar, initNavbarAuth } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { getUser, getSessionToken } from '../utils/auth.js';

export function renderReport() {
  return {
    html: `
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

            <!-- Auth Warning -->
            <div id="report-auth-warning" style="display:none;margin-bottom:var(--space-6);padding:var(--space-4);background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius);color:#fbbf24;font-size:0.875rem;text-align:center">
              <span class="material-symbols-outlined" style="vertical-align:middle;margin-right:0.5rem">warning</span>
              You must be signed in to submit a report. <a href="#/login" style="font-weight:var(--fw-bold);text-decoration:underline;color:#fbbf24">Sign In</a>
            </div>

            <!-- Status Message -->
            <div id="report-msg" style="display:none;margin-bottom:var(--space-6);padding:var(--space-4);border-radius:var(--radius);font-size:0.875rem"></div>

            <form id="report-form" style="display:flex;flex-direction:column;gap:var(--space-6)">

              <!-- Photo Upload -->
              <div class="form-group">
                <label class="form-label" style="font-weight:var(--fw-bold)">Upload Photo *</label>
                <input type="file" id="report-image" name="image" accept="image/*" required style="display:none">
                <div id="upload-dropzone" style="border:2px dashed rgba(74,222,128,0.25);border-radius:var(--radius-lg);padding:var(--space-10);text-align:center;cursor:pointer;background:rgba(74,222,128,0.02);transition:all 0.2s">
                  <span class="material-symbols-outlined" style="font-size:2.5rem;color:var(--color-primary);display:block;margin-bottom:var(--space-3)">cloud_upload</span>
                  <p id="upload-text" style="font-weight:var(--fw-bold);margin-bottom:var(--space-1)">Click to upload image</p>
                  <p style="font-size:0.75rem;color:var(--color-slate-500)">PNG, JPG, WebP. Geo-tagged images required for risk mapping.</p>
                </div>
              </div>

              <!-- Species + Category row -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5)">
                <div class="form-group">
                  <label class="form-label">Species Name (if known)</label>
                  <div class="form-input-icon">
                    <span class="material-symbols-outlined">eco</span>
                    <input class="form-input" id="report-species" type="text" placeholder="e.g., Lantana camara">
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

              <!-- Location + Date row -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5)">
                <div class="form-group">
                  <label class="form-label">Location</label>
                  <div class="form-input-icon">
                    <span class="material-symbols-outlined">location_on</span>
                    <input class="form-input" type="text" placeholder="GPS or address">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Date Observed</label>
                  <input
                    class="form-input"
                    id="report-date"
                    type="date"
                    style="cursor:pointer;padding-right:0.75rem"
                  >
                </div>
              </div>

              <!-- Severity + Observation Type -->
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
                  <label class="form-label">Observation Type *</label>
                  <select class="form-input" id="report-type" required>
                    <option value="">Select type...</option>
                    <option>Invasive Plant</option>
                    <option>Invasive Animal</option>
                    <option>Invasive Insect</option>
                    <option>Unknown / Unsure</option>
                  </select>
                </div>
              </div>

              <!-- Description -->
              <div class="form-group">
                <label class="form-label">Description *</label>
                <textarea class="form-input" id="report-desc" rows="4" placeholder="Describe the habitat, density, spread area, surrounding vegetation, proximity to water..." required style="resize:vertical"></textarea>
              </div>

              <!-- Info note -->
              <div style="background:rgba(74,222,128,0.04);border:1px solid rgba(74,222,128,0.12);border-radius:var(--radius);padding:var(--space-4);font-size:0.8125rem;color:var(--color-slate-600);display:flex;gap:var(--space-3);align-items:flex-start">
                <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:1.125rem;flex-shrink:0;margin-top:2px">info</span>
                <span>Reports are processed by our AI classification engine. Location and timestamp are extracted automatically from image metadata.</span>
              </div>

              <!-- Submit -->
              <button type="submit" id="report-submit-btn" class="btn btn-primary btn-lg" style="width:100%">
                <span class="material-symbols-outlined" style="font-size:1.125rem">send</span>
                <span id="report-btn-text">Submit Report to Detection Network</span>
              </button>
            </form>
          </div>
        </div>

        <!-- AI Analysis Result Card (hidden until analysis complete) -->
        <div id="ai-result-section" style="display:none;margin-top:var(--space-8)">
          <div class="ai-result-card">
            <div class="ai-result-header">
              <div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap">
                <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:1.5rem">psychology</span>
                <h2 style="font-size:1.125rem;font-weight:var(--fw-bold);color:var(--color-slate-900);margin:0">AI Species Analysis</h2>
                <span id="ai-used-vision-badge" style="display:none;font-size:0.6875rem;font-weight:var(--fw-bold);padding:2px 8px;border-radius:999px;background:rgba(74,222,128,0.12);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.08em">Vision ✓</span>
              </div>
              <span id="ai-label-badge" class="ai-label-badge"></span>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6);margin-bottom:var(--space-6)">
              <div>
                <p style="font-size:0.75rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.08em;color:var(--color-slate-500);margin-bottom:var(--space-2)">AI Confidence</p>
                <p id="ai-confidence-val" style="font-size:1.5rem;font-weight:var(--fw-bold);color:var(--color-slate-900)"></p>
              </div>
              <div>
                <p style="font-size:0.75rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.08em;color:var(--color-slate-500);margin-bottom:var(--space-2)">Ecological Risk Score</p>
                <p id="ai-risk-val" style="font-size:1.5rem;font-weight:var(--fw-bold);color:var(--color-slate-900)"></p>
                <div class="risk-bar-track"><div id="ai-risk-bar" class="risk-bar-fill"></div></div>
              </div>
            </div>

            <div style="margin-bottom:var(--space-5)">
              <p style="font-size:0.75rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.08em;color:var(--color-slate-500);margin-bottom:var(--space-3)">Identified Tags</p>
              <div id="ai-tags-list" style="display:flex;flex-wrap:wrap;gap:var(--space-2)"></div>
            </div>

            <div style="background:rgba(74,222,128,0.04);border-left:3px solid var(--color-primary);border-radius:0 var(--radius) var(--radius) 0;padding:var(--space-4) var(--space-5)">
              <p style="font-size:0.75rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.08em;color:var(--color-primary);margin-bottom:var(--space-2)">Ecological Assessment</p>
              <p id="ai-summary-text" style="color:var(--color-slate-700);font-size:0.9375rem;line-height:1.7;margin:0"></p>
            </div>
          </div>

          <div id="map-section" style="margin-top:var(--space-6)">
            <div class="ai-result-card" style="padding:0;overflow:hidden">
              <div style="padding:var(--space-5) var(--space-6);border-bottom:1px solid rgba(74,222,128,0.08);display:flex;align-items:center;gap:var(--space-3)">
                <span class="material-symbols-outlined" style="color:var(--color-primary)">location_on</span>
                <div>
                  <h3 style="font-size:1rem;font-weight:var(--fw-bold);color:var(--color-slate-900);margin:0">Sighting Location</h3>
                  <p id="map-coords-label" style="font-size:0.8125rem;color:var(--color-slate-500);margin:0"></p>
                </div>
                <a id="maps-open-link" href="#" target="_blank" rel="noopener" style="margin-left:auto;font-size:0.8125rem;font-weight:var(--fw-bold);color:var(--color-primary);text-decoration:none;display:flex;align-items:center;gap:4px">
                  <span class="material-symbols-outlined" style="font-size:1rem">open_in_new</span> Open in Google Maps
                </a>
              </div>
              <div id="report-map" style="height:320px;width:100%;background:var(--color-slate-100)"></div>
            </div>
          </div>

          <div id="no-gps-warning" style="display:none;margin-top:var(--space-6);padding:var(--space-5);background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25);border-radius:var(--radius);align-items:flex-start;gap:var(--space-3)">
            <span class="material-symbols-outlined" style="color:#d97706;flex-shrink:0">location_off</span>
            <div>
              <p style="font-weight:var(--fw-bold);color:#fbbf24;margin:0 0 4px">No GPS coordinates found</p>
              <p style="font-size:0.875rem;color:var(--color-slate-600);margin:0">Your image didn't contain GPS metadata. Turn on location tagging in your camera app before capturing images.</p>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ═══ IMPACT SECTION ═══ -->
    <section class="section" style="background:linear-gradient(180deg,#0d2010 0%,#0a1a0f 100%);padding:var(--space-20) 0;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(74,222,128,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,0.02) 1px,transparent 1px);background-size:80px 80px;pointer-events:none"></div>

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
    <section class="section" style="background:linear-gradient(180deg,#0a1a0f 0%,#0d2010 100%);padding:var(--space-16) 0;border-top:1px solid rgba(74,222,128,0.1)">
      <div class="container">
        <div class="section-header reveal" style="margin-bottom:var(--space-12)">
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-3);display:inline-block">Field Guide</span>
          <h2 class="section-title">Reporting Best Practices</h2>
          <div class="section-divider"></div>
        </div>

        <div class="three-col-grid">
          <div class="card hover-lift reveal" data-delay="0" style="padding:var(--space-8) var(--space-6)">
            <div style="width:3rem;height:3rem;border-radius:var(--radius-lg);background:rgba(74,222,128,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary)">photo_camera</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Clear Photos</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.7">Capture multiple angles — leaves, stems, flowers, and the overall habitat. Good photos increase AI confidence from 60% to 94%.</p>
          </div>
          <div class="card hover-lift reveal" data-delay="100" style="padding:var(--space-8) var(--space-6)">
            <div style="width:3rem;height:3rem;border-radius:var(--radius-lg);background:rgba(74,222,128,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary)">my_location</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Precise Location</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.7">Enable GPS on your device. Accurate coordinates help our satellite cross-reference system validate sightings faster.</p>
          </div>
          <div class="card hover-lift reveal" data-delay="200" style="padding:var(--space-8) var(--space-6)">
            <div style="width:3rem;height:3rem;border-radius:var(--radius-lg);background:rgba(74,222,128,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-4)">
              <span class="material-symbols-outlined" style="color:var(--color-primary)">description</span>
            </div>
            <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2)">Detailed Notes</h3>
            <p style="color:var(--color-slate-600);font-size:0.8125rem;line-height:1.7">Note the habitat type, water proximity, spread area, and any identifiers. Context helps researchers assess severity accurately.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ EXPERT VALIDATION ═══ -->
    <section style="background:linear-gradient(180deg,#0d2010 0%,#0a1a0f 100%);padding:var(--space-16) 0;border-top:1px solid rgba(74,222,128,0.08)">
      <div class="container" style="max-width:48rem;text-align:center">
        <div class="reveal">
          <span class="material-symbols-outlined" style="font-size:2.5rem;color:rgba(74,222,128,0.3);display:block;margin-bottom:var(--space-4)">science</span>
          <h2 style="font-weight:var(--fw-bold);margin-bottom:var(--space-3);font-size:1.5rem;color:var(--color-slate-900)">Request Expert Validation</h2>
          <p style="color:var(--color-slate-600);margin-bottom:var(--space-6);line-height:1.7">Unsure about a species? Submit your observation for expert review and containment recommendations.</p>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSe-I2Ebso1LPhh4mPHetvJXRMBkVqK73gtSxA9aZ_Ty109mkg/viewform?usp=header" target="_blank" rel="noopener noreferrer" class="btn btn-lg btn-micro" style="border:1px solid var(--color-primary);color:var(--color-primary);background:rgba(74,222,128,0.06)">
            <span class="material-symbols-outlined" style="font-size:1.125rem">contact_mail</span> Contact an Expert
          </a>
        </div>
      </div>
    </section>

  </main>
  ${renderFooter()}`,

    async init() {
      initNavbarAuth();

      // ── Date picker setup: set max = today, default value = today (ISO yyyy-mm-dd)
      const dateInput = document.getElementById('report-date');
      if (dateInput) {
        const todayISO = new Date().toISOString().slice(0, 10);
        dateInput.max = todayISO;   // prevent future dates
        dateInput.value = todayISO;   // pre-fill with today so field is immediately useful
        dateInput.addEventListener('change', () => {
          console.log('[TerraShield] Date Observed selected:', dateInput.value); // yyyy-mm-dd confirmed
        });
      }
      // Check auth status immediately
      const user = await getUser();
      const form = document.getElementById('report-form');
      const authWarn = document.getElementById('report-auth-warning');
      const submitBtn = document.getElementById('report-submit-btn');

      if (!user) {
        // Disable form if not logged in
        authWarn.style.display = 'block';
        Array.from(form.elements).forEach(el => el.disabled = true);
        document.getElementById('upload-dropzone').style.opacity = '0.5';
        document.getElementById('upload-dropzone').style.cursor = 'not-allowed';
      }

      // File upload UI wiring
      const fileInput = document.getElementById('report-image');
      const dropzone = document.getElementById('upload-dropzone');
      const uploadText = document.getElementById('upload-text');

      dropzone.addEventListener('click', () => {
        if (user) fileInput.click();
      });

      dropzone.addEventListener('dragover', (e) => {
        if (!user) return;
        e.preventDefault();
        dropzone.style.borderColor = 'var(--color-primary)';
        dropzone.style.background = 'rgba(29,172,201,0.06)';
      });

      dropzone.addEventListener('dragleave', (e) => {
        if (!user) return;
        e.preventDefault();
        dropzone.style.borderColor = 'rgba(29,172,201,0.3)';
        dropzone.style.background = 'rgba(29,172,201,0.02)';
      });

      dropzone.addEventListener('drop', (e) => {
        if (!user) return;
        e.preventDefault();
        dropzone.style.borderColor = 'rgba(29,172,201,0.3)';
        dropzone.style.background = 'rgba(29,172,201,0.02)';

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          fileInput.files = e.dataTransfer.files;
          updateFileName();
        }
      });

      fileInput.addEventListener('change', updateFileName);

      function updateFileName() {
        if (fileInput.files.length > 0) {
          const file = fileInput.files[0];
          uploadText.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
          uploadText.style.color = 'var(--color-primary)';
        }
      }

      // ─── Helpers ──────────────────────────────────────────────────────────────

      function showMsg(html, type = 'success') {
        const msg = document.getElementById('report-msg');
        msg.style.display = 'block';
        if (type === 'success') {
          msg.style.background = 'var(--color-emerald-50)';
          msg.style.color = 'var(--color-emerald)';
          msg.style.border = '1px solid rgba(16,185,129,0.2)';
        } else if (type === 'info') {
          msg.style.background = 'rgba(29,172,201,0.06)';
          msg.style.color = 'var(--color-primary)';
          msg.style.border = '1px solid rgba(29,172,201,0.2)';
        } else {
          msg.style.background = 'var(--color-red-50)';
          msg.style.color = 'var(--color-red)';
          msg.style.border = '1px solid rgba(239,68,68,0.2)';
        }
        msg.innerHTML = html;
      }

      function labelConfig(label) {
        const map = {
          'invasive-plant': { text: 'Invasive Plant', cls: 'ai-label-invasive' },
          'invasive-animal': { text: 'Invasive Animal', cls: 'ai-label-invasive' },
          'deforestation': { text: 'Deforestation', cls: 'ai-label-critical' },
          'wildfire': { text: 'Wildfire Risk', cls: 'ai-label-critical' },
          'urban-encroachment': { text: 'Urban Encroachment', cls: 'ai-label-elevated' },
          'flood-risk': { text: 'Flood Risk', cls: 'ai-label-elevated' },
          'normal-terrain': { text: 'Normal Terrain', cls: 'ai-label-normal' },
          'unknown': { text: 'Unknown', cls: 'ai-label-unknown' },
        };
        return map[label] || { text: label, cls: 'ai-label-unknown' };
      }

      function riskColor(score) {
        if (score >= 7) return '#ef4444';
        if (score >= 4) return '#f59e0b';
        return '#10b981';
      }

      function renderAiResult(ai, gps, mapsUrl) {
        // Show the result section
        const section = document.getElementById('ai-result-section');
        section.style.display = 'block';

        // Vision badge
        if (ai.used_vision) {
          document.getElementById('ai-used-vision-badge').style.display = 'inline';
        }

        // Label badge
        const cfg = labelConfig(ai.ai_label);
        const badge = document.getElementById('ai-label-badge');
        badge.textContent = cfg.text;
        badge.className = `ai-label-badge ${cfg.cls}`;

        // Confidence
        const confPct = Math.round((ai.ai_confidence || 0) * 100);
        document.getElementById('ai-confidence-val').textContent = `${confPct}%`;

        // Risk score
        const risk = Number(ai.ai_risk_score || 0).toFixed(1);
        const riskEl = document.getElementById('ai-risk-val');
        riskEl.textContent = `${risk} / 10`;
        riskEl.style.color = riskColor(ai.ai_risk_score);

        const bar = document.getElementById('ai-risk-bar');
        bar.style.width = `${(ai.ai_risk_score / 10) * 100}%`;
        bar.style.background = riskColor(ai.ai_risk_score);

        // Tags
        const tagsList = document.getElementById('ai-tags-list');
        tagsList.innerHTML = '';
        const tags = Array.isArray(ai.ai_tags) ? ai.ai_tags : [];
        tags.forEach(tag => {
          const chip = document.createElement('span');
          chip.className = 'ai-tag-chip';
          chip.textContent = tag;
          tagsList.appendChild(chip);
        });

        // Summary
        document.getElementById('ai-summary-text').textContent = ai.ai_summary || 'No summary available.';

        // Map
        if (gps && gps.latitude !== null && gps.longitude !== null) {
          const lat = gps.latitude;
          const lng = gps.longitude;

          document.getElementById('map-coords-label').textContent =
            `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`;

          const link = document.getElementById('maps-open-link');
          link.href = mapsUrl || `https://www.google.com/maps?q=${lat},${lng}`;

          document.getElementById('map-section').style.display = 'block';
          document.getElementById('no-gps-warning').style.display = 'none';

          // Load Leaflet CSS + JS from CDN then init map
          loadLeaflet(() => {
            // Small timeout lets the DOM fully render the map div
            setTimeout(() => {
              const L = window.L;
              // Destroy any existing map instance on this element
              const mapEl = document.getElementById('report-map');
              if (mapEl._leaflet_id) {
                mapEl._leaflet_id = null;
              }
              const map = L.map('report-map').setView([lat, lng], 14);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
              }).addTo(map);

              // Custom marker icon
              const icon = L.divIcon({
                html: `<div style="
                  width:36px;height:36px;border-radius:50% 50% 50% 0;
                  background:var(--color-primary);
                  border:3px solid #fff;
                  box-shadow:0 2px 8px rgba(0,0,0,0.3);
                  transform:rotate(-45deg);
                  display:flex;align-items:center;justify-content:center;
                "><span style="transform:rotate(45deg);font-size:14px;color:#fff;font-family:Material Symbols Outlined">location_on</span></div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -36],
                className: '',
              });

              L.marker([lat, lng], { icon })
                .addTo(map)
                .bindPopup(`
                  <div style="font-family:inherit;min-width:160px">
                    <strong style="color:var(--color-slate-900)">Sighting Location</strong><br>
                    <span style="font-size:0.8rem;color:#64748b">${lat.toFixed(5)}°, ${lng.toFixed(5)}°</span><br>
                    <a href="${mapsUrl || '#'}" target="_blank" style="font-size:0.8rem;color:#1DACC9">Open in Google Maps ↗</a>
                  </div>
                `)
                .openPopup();
            }, 100);
          });
        } else {
          // No GPS
          document.getElementById('map-section').style.display = 'none';
          const warn = document.getElementById('no-gps-warning');
          warn.style.display = 'flex';
        }

        // Scroll the result into view smoothly
        setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      }

      function loadLeaflet(callback) {
        if (window.L) { callback(); return; }

        // CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // JS
        if (!document.getElementById('leaflet-js')) {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = callback;
          document.head.appendChild(script);
        } else {
          callback();
        }
      }

      // ─── Form Submission ──────────────────────────────────────────────────────
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!user) return;

        const file = fileInput.files[0];
        if (!file) {
          alert('Please select an image first.');
          return;
        }

        const btnText = document.getElementById('report-btn-text');
        const msg = document.getElementById('report-msg');

        // Hide any previous AI result section
        document.getElementById('ai-result-section').style.display = 'none';

        // ── Step 1: Extract EXIF ──────────────────────────────────────────────
        submitBtn.disabled = true;
        btnText.textContent = 'Extracting EXIF metadata…';
        msg.style.display = 'none';

        try {
          const formData = new FormData();
          formData.append('image', file);

          // Append the manually selected date (ISO yyyy-mm-dd) so the backend
          // can use it as the observation date when EXIF has no DateTimeOriginal
          const dateInput = document.getElementById('report-date');
          if (dateInput && dateInput.value) {
            formData.append('observed_date', dateInput.value);
          }

          const token = await getSessionToken();
          const headers = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const exifRes = await fetch('/api/extract-exif', {
            method: 'POST',
            headers,
            body: formData,
          });

          const exifData = await exifRes.json();

          if (!exifRes.ok || !exifData.success) {
            throw new Error(exifData.error || `Server error: ${exifRes.status}`);
          }

          const { recordId, gps, mapsUrl } = exifData;

          // Let user know EXIF worked, now running AI
          showMsg(`
            <strong>✓ Image received (ID: ${recordId})</strong>
            <span style="display:block;margin-top:2px;font-size:0.8125rem;opacity:0.85">
              ${gps?.latitude != null ? `GPS: ${gps.latitude.toFixed(4)}°, ${gps.longitude.toFixed(4)}°` : 'No GPS in image'}
            </span>
          `, 'success');

          // ── Step 2: AI Analysis ───────────────────────────────────────────
          btnText.textContent = 'Running AI species analysis…';

          const aiRes = await fetch('/api/analyse-exif', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ recordId }),
          });

          const aiData = await aiRes.json();

          if (!aiRes.ok || !aiData.success || !aiData.analysed?.length) {
            // AI failed — still show the EXIF success but warn
            showMsg(`
              <strong>✓ Report stored (ID: ${recordId})</strong>
              <span style="display:block;margin-top:4px;font-size:0.8125rem;color:#b45309">
                ⚠ AI analysis unavailable: ${aiData.errors?.[0]?.error || aiData.error || 'Unknown error'}
              </span>
            `, 'success');
            return;
          }

          // Merge GPS into analysed result for convenience
          const ai = { ...aiData.analysed[0], ai_tags: aiData.analysed[0].ai_tags || [] };

          // ── TerraPoints: read from API response ──────────────────────────────
          const pointsAwarded = ai.points_awarded ?? 0;
          const updatedUser = ai.updated_user ?? null;

          // Persist updated terra_points locally so the profile page is current
          if (updatedUser) {
            try {
              const stored = JSON.parse(localStorage.getItem('terrashield_user_meta') || '{}');
              localStorage.setItem('terrashield_user_meta', JSON.stringify({ ...stored, ...updatedUser }));
            } catch (_) { /* storage unavailable */ }
          }

          // Build points badge HTML
          const pointsBadge = pointsAwarded > 0
            ? `<span style="display:inline-flex;align-items:center;gap:4px;margin-top:4px;padding:2px 10px;background:rgba(74,222,128,0.12);border-radius:999px;font-size:0.8rem;font-weight:700;color:#22c55e">
                🌿 +${pointsAwarded} TerraPoints earned
               </span>`
            : '';

          // Update status message to full success
          showMsg(`
            <strong>✓ Report submitted &amp; analysed (ID: ${recordId})</strong>
            <span style="display:block;margin-top:2px;font-size:0.8125rem;opacity:0.85">AI classification complete — results below</span>
            ${pointsBadge}
          `, 'success');

          // Reset form inputs
          form.reset();
          uploadText.textContent = 'Click to upload image';
          uploadText.style.color = 'inherit';

          // Render AI result card + map
          renderAiResult(ai, gps, mapsUrl);

        } catch (error) {
          showMsg(`<strong>Submission Failed:</strong> ${error.message}`, 'error');
        } finally {
          submitBtn.disabled = false;
          btnText.textContent = 'Submit Report to Detection Network';
        }
      });
    }
  };
}
