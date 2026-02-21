// Report a Sighting Page
import { renderNavbar, initNavbarAuth } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { getUser, getSessionToken } from '../utils/auth.js';

export function renderReport() {
  return {
    html: `
  ${renderNavbar('report')}
  <main style="padding-top:var(--nav-height)">

    <!-- Header -->
    <section style="background:var(--color-primary-10);padding:var(--space-16) 0;position:relative">
      <div class="container" style="text-align:center">
        <span class="hero-animate" style="font-size:0.65rem;font-weight:var(--fw-bold);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-4);display:inline-block">Field Reporting</span>
        <h1 class="font-serif hero-animate" style="font-size:clamp(2rem,5vw,2.75rem);font-weight:var(--fw-bold);color:var(--color-slate-900);margin-bottom:var(--space-3)">Report a Sighting</h1>
        <p class="hero-animate-delay" style="color:var(--color-slate-600);max-width:36rem;margin:0 auto">Submit a geo-tagged observation to the TerraShield detection network. Every verified report strengthens ecological defense.</p>
      </div>
    </section>

    <!-- Form -->
    <section class="section" style="background:var(--color-bg-light);padding:var(--space-16) 0">
      <div class="container" style="max-width:48rem">
        <div class="card reveal" style="padding:var(--space-10)">
          
          <!-- Auth Warning -->
          <div id="report-auth-warning" style="display:none;margin-bottom:var(--space-6);padding:var(--space-4);background:var(--color-amber-50);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius);color:#b45309;font-size:0.875rem;text-align:center">
            <span class="material-symbols-outlined" style="vertical-align:middle;margin-right:0.5rem">warning</span>
            You must be signed in to submit a report. <a href="#/login" style="font-weight:var(--fw-bold);text-decoration:underline">Sign In</a>
          </div>

          <!-- Status Message -->
          <div id="report-msg" style="display:none;margin-bottom:var(--space-6);padding:var(--space-4);border-radius:var(--radius);font-size:0.875rem"></div>

          <form id="report-form" style="display:flex;flex-direction:column;gap:var(--space-6)">
            <!-- Photo Upload -->
            <div class="form-group">
              <label class="form-label" style="font-weight:var(--fw-bold)">Upload Photo *</label>
              
              <input type="file" id="report-image" name="image" accept="image/*" required style="display:none">
              
              <div id="upload-dropzone" style="border:2px dashed rgba(29,172,201,0.3);border-radius:var(--radius-lg);padding:var(--space-10);text-align:center;cursor:pointer;background:rgba(29,172,201,0.02);transition:all 0.2s">
                <span class="material-symbols-outlined" style="font-size:2.5rem;color:var(--color-primary);display:block;margin-bottom:var(--space-3)">cloud_upload</span>
                <p id="upload-text" style="font-weight:var(--fw-bold);margin-bottom:var(--space-1)">Click to upload image</p>
                <p style="font-size:0.75rem;color:var(--color-slate-500)">PNG, JPG, WebP. Geo-tagged images required for risk mapping.</p>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6)">
              <div class="form-group">
                <label class="form-label">Species Name (if known)</label>
                <div class="form-input-icon">
                  <span class="material-symbols-outlined">eco</span>
                  <input class="form-input" id="report-species" type="text" placeholder="e.g., Lantana camara">
                </div>
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

            <div class="form-group">
              <label class="form-label">Description *</label>
              <textarea class="form-input" id="report-desc" rows="4" placeholder="Describe what you observed: habitat, density, spread area, and any other observations. DO NOT enter location explicitly, GPS data will be extracted automatically..." required style="resize:vertical"></textarea>
            </div>

            <div style="background:rgba(29,172,201,0.05);border:1px solid rgba(29,172,201,0.15);border-radius:var(--radius);padding:var(--space-4);font-size:0.8125rem;color:var(--color-slate-600);display:flex;gap:var(--space-3);align-items:flex-start">
              <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:1.125rem;flex-shrink:0;margin-top:2px">info</span>
              <span>Submitted reports are processed by our AI classification engine. Location and timestamp are extracted automatically from image metadata. Image pixels and metadata are safely stored locally in SQLite linked to your ID.</span>
            </div>

            <button type="submit" id="report-submit-btn" class="btn btn-primary btn-lg" style="width:100%">
              <span class="material-symbols-outlined" style="font-size:1.125rem">send</span> 
              <span id="report-btn-text">Submit Report to Detection Network</span>
            </button>
          </form>
        </div>

        <!-- AI Analysis Result Card (hidden until analysis complete) -->
        <div id="ai-result-section" style="display:none;margin-top:var(--space-8)">
          <div class="ai-result-card">
            <!-- Card Header -->
            <div class="ai-result-header">
              <div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap">
                <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:1.5rem">psychology</span>
                <h2 style="font-size:1.125rem;font-weight:var(--fw-bold);color:var(--color-slate-900);margin:0">AI Species Analysis</h2>
                <span id="ai-used-vision-badge" style="display:none;font-size:0.6875rem;font-weight:var(--fw-bold);padding:2px 8px;border-radius:999px;background:rgba(29,172,201,0.12);color:var(--color-primary);text-transform:uppercase;letter-spacing:0.08em">Vision ✓</span>
              </div>
              <span id="ai-label-badge" class="ai-label-badge"></span>
            </div>

            <!-- Confidence + Risk -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6);margin-bottom:var(--space-6)">
              <div>
                <p style="font-size:0.75rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.08em;color:var(--color-slate-500);margin-bottom:var(--space-2)">AI Confidence</p>
                <p id="ai-confidence-val" style="font-size:1.5rem;font-weight:var(--fw-bold);color:var(--color-slate-900)"></p>
              </div>
              <div>
                <p style="font-size:0.75rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.08em;color:var(--color-slate-500);margin-bottom:var(--space-2)">Ecological Risk Score</p>
                <p id="ai-risk-val" style="font-size:1.5rem;font-weight:var(--fw-bold);color:var(--color-slate-900)"></p>
                <div class="risk-bar-track">
                  <div id="ai-risk-bar" class="risk-bar-fill"></div>
                </div>
              </div>
            </div>

            <!-- AI Tags -->
            <div style="margin-bottom:var(--space-5)">
              <p style="font-size:0.75rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.08em;color:var(--color-slate-500);margin-bottom:var(--space-3)">Identified Tags</p>
              <div id="ai-tags-list" style="display:flex;flex-wrap:wrap;gap:var(--space-2)"></div>
            </div>

            <!-- AI Summary -->
            <div style="background:rgba(29,172,201,0.04);border-left:3px solid var(--color-primary);border-radius:0 var(--radius) var(--radius) 0;padding:var(--space-4) var(--space-5)">
              <p style="font-size:0.75rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.08em;color:var(--color-primary);margin-bottom:var(--space-2)">Ecological Assessment</p>
              <p id="ai-summary-text" style="color:var(--color-slate-700);font-size:0.9375rem;line-height:1.7;margin:0"></p>
            </div>
          </div>

          <!-- Location Map -->
          <div id="map-section" style="margin-top:var(--space-6)">
            <div class="ai-result-card" style="padding:0;overflow:hidden">
              <div style="padding:var(--space-5) var(--space-6);border-bottom:1px solid var(--color-slate-100);display:flex;align-items:center;gap:var(--space-3)">
                <span class="material-symbols-outlined" style="color:var(--color-primary)">location_on</span>
                <div>
                  <h3 style="font-size:1rem;font-weight:var(--fw-bold);color:var(--color-slate-900);margin:0">Sighting Location</h3>
                  <p id="map-coords-label" style="font-size:0.8125rem;color:var(--color-slate-500);margin:0"></p>
                </div>
                <a id="maps-open-link" href="#" target="_blank" rel="noopener" style="margin-left:auto;font-size:0.8125rem;font-weight:var(--fw-bold);color:var(--color-primary);text-decoration:none;display:flex;align-items:center;gap:4px">
                  <span class="material-symbols-outlined" style="font-size:1rem">open_in_new</span> Open in Google Maps
                </a>
              </div>
              <!-- Leaflet map goes here -->
              <div id="report-map" style="height:320px;width:100%;background:var(--color-slate-100)"></div>
            </div>
          </div>

          <!-- No-GPS Warning (shown instead of map when GPS unavailable) -->
          <div id="no-gps-warning" style="display:none;margin-top:var(--space-6);padding:var(--space-5);background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25);border-radius:var(--radius);display:flex;align-items:flex-start;gap:var(--space-3)">
            <span class="material-symbols-outlined" style="color:#d97706;flex-shrink:0">location_off</span>
            <div>
              <p style="font-weight:var(--fw-bold);color:#b45309;margin:0 0 4px">No GPS coordinates found</p>
              <p style="font-size:0.875rem;color:var(--color-slate-600);margin:0">Your image didn't contain GPS metadata — map pinpointing is unavailable. To enable location mapping, turn on location tagging in your camera app before capturing images.</p>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Expert Validation -->
    <section style="background:#fff;padding:var(--space-16) 0;border-top:1px solid var(--color-slate-200)">
      <div class="container" style="max-width:48rem;text-align:center">
        <div class="reveal">
          <span class="material-symbols-outlined" style="font-size:2.5rem;color:rgba(29,172,201,0.3);display:block;margin-bottom:var(--space-4)">science</span>
          <h2 style="font-weight:var(--fw-bold);margin-bottom:var(--space-3);font-size:1.5rem;color:var(--color-slate-900)">Request Expert Validation</h2>
          <p style="color:var(--color-slate-600);margin-bottom:var(--space-6);line-height:1.7">Unsure about a species? Submit your observation for expert review and containment recommendations.</p>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSe-I2Ebso1LPhh4mPHetvJXRMBkVqK73gtSxA9aZ_Ty109mkg/viewform?usp=header" target="_blank" rel="noopener noreferrer" class="btn btn-lg btn-micro" style="border:1px solid var(--color-primary);color:var(--color-primary);background:rgba(29,172,201,0.06)">
            <span class="material-symbols-outlined" style="font-size:1.125rem">contact_mail</span> Contact an Expert
          </a>
        </div>
      </div>
    </section>

  </main>
  ${renderFooter()}`,

    async init() {
      initNavbarAuth();

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

          // Update status message to full success
          showMsg(`
            <strong>✓ Report submitted &amp; analysed (ID: ${recordId})</strong>
            <span style="display:block;margin-top:2px;font-size:0.8125rem;opacity:0.85">AI classification complete — results below</span>
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
