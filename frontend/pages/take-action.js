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
      </div>
    </section>

    <!-- Expert Validation -->
    <section style="background:#fff;padding:var(--space-16) 0;border-top:1px solid var(--color-slate-200)">
      <div class="container" style="max-width:48rem;text-align:center">
        <div class="reveal">
          <span class="material-symbols-outlined" style="font-size:2.5rem;color:rgba(29,172,201,0.3);display:block;margin-bottom:var(--space-4)">science</span>
          <h2 style="font-weight:var(--fw-bold);margin-bottom:var(--space-3);font-size:1.5rem;color:var(--color-slate-900)">Request Expert Validation</h2>
          <p style="color:var(--color-slate-600);margin-bottom:var(--space-6);line-height:1.7">Unsure about a species? Submit your observation for expert review and containment recommendations.</p>
          <a href="mailto:experts@terrashield.org" class="btn btn-lg btn-micro" style="border:1px solid var(--color-primary);color:var(--color-primary);background:rgba(29,172,201,0.06)">
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

      // Form Submission
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!user) return;

        const file = fileInput.files[0];
        if (!file) {
          alert("Please select an image first.");
          return;
        }

        const btnText = document.getElementById('report-btn-text');
        const msg = document.getElementById('report-msg');

        // UI Loading state
        submitBtn.disabled = true;
        btnText.textContent = 'Extracting EXIF metadata...';
        msg.style.display = 'none';

        try {
          // Prepare FormData payload for backend API
          const formData = new FormData();
          formData.append("image", file);

          // Get explicitly the user's session token to pass manually
          // The Next.js SSR cookie client doesn't automatically see the CDN client's localstorage session by default without a dedicated auth/callback route syncing it.
          const token = await getSessionToken();

          const headers = {};
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          // Send to Next.js API route (/api/extract-exif)
          const response = await fetch('/api/extract-exif', {
            method: 'POST',
            headers,
            body: formData,
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || `Server error: ${response.status}`);
          }

          if (result.success) {
            // Success State
            msg.style.display = 'block';
            msg.style.background = 'var(--color-emerald-50)';
            msg.style.color = 'var(--color-emerald)';
            msg.style.border = '1px solid rgba(16,185,129,0.2)';

            let gpsInfo = "No GPS coordinates found in image metadata.";
            if (result.gps && result.gps.latitude !== null) {
              gpsInfo = `GPS Coordinates extracted: ${result.gps.latitude.toFixed(4)}, ${result.gps.longitude.toFixed(4)}`;
            }

            msg.innerHTML = `
              <strong style="display:block;margin-bottom:0.25rem">✓ Report Submitted Successfully</strong>
              <p>Image securely stored to your account (ID: ${result.recordId}).</p>
              <p style="margin-top:0.25rem;font-size:0.75rem">${gpsInfo}</p>
            `;

            // Reset form
            form.reset();
            uploadText.textContent = "Click to upload image";
            uploadText.style.color = 'inherit';
          } else {
            throw new Error(result.error || "Unknown extraction error");
          }

        } catch (error) {
          msg.style.display = 'block';
          msg.style.background = 'var(--color-red-50)';
          msg.style.color = 'var(--color-red)';
          msg.style.border = '1px solid rgba(239,68,68,0.2)';
          msg.innerHTML = `<strong>Submission Failed:</strong> ${error.message}`;
        } finally {
          submitBtn.disabled = false;
          btnText.textContent = 'Submit Report to Detection Network';
        }
      });
    }
  };
}
