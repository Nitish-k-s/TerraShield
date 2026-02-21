// Report a Sighting Page
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

export function renderReport() {
  return `
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
          <form id="report-form" style="display:flex;flex-direction:column;gap:var(--space-6)">
            <!-- Photo Upload -->
            <div class="form-group">
              <label class="form-label" style="font-weight:var(--fw-bold)">Upload Photo *</label>
              <div style="border:2px dashed rgba(29,172,201,0.3);border-radius:var(--radius-lg);padding:var(--space-10);text-align:center;cursor:pointer;background:rgba(29,172,201,0.02);transition:border-color 0.2s">
                <span class="material-symbols-outlined" style="font-size:2.5rem;color:var(--color-primary);display:block;margin-bottom:var(--space-3)">cloud_upload</span>
                <p style="font-weight:var(--fw-bold);margin-bottom:var(--space-1)">Click to upload or drag and drop</p>
                <p style="font-size:0.75rem;color:var(--color-slate-500)">PNG, JPG up to 10MB. Geo-tagged images preferred.</p>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6)">
              <div class="form-group">
                <label class="form-label">Species Name (if known)</label>
                <div class="form-input-icon">
                  <span class="material-symbols-outlined">eco</span>
                  <input class="form-input" type="text" placeholder="e.g., Japanese Knotweed">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Observation Type *</label>
                <select class="form-input" required>
                  <option value="">Select type...</option>
                  <option>Invasive Plant</option>
                  <option>Invasive Animal</option>
                  <option>Invasive Insect</option>
                  <option>Unknown / Unsure</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Location *</label>
              <div class="form-input-icon">
                <span class="material-symbols-outlined">location_on</span>
                <input class="form-input" type="text" placeholder="GPS coordinates or address" required>
              </div>
              <p style="font-size:0.7rem;color:var(--color-slate-500);margin-top:var(--space-1)">Enable location services for automatic geo-tagging.</p>
            </div>

            <div class="form-group">
              <label class="form-label">Description *</label>
              <textarea class="form-input" rows="4" placeholder="Describe what you observed: habitat, density, spread area, and any other observations..." required style="resize:vertical"></textarea>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6)">
              <div class="form-group">
                <label class="form-label">Date of Observation *</label>
                <input class="form-input" type="date" required>
              </div>
              <div class="form-group">
                <label class="form-label">Estimated Area Affected</label>
                <select class="form-input">
                  <option value="">Select estimate...</option>
                  <option>&lt; 10 sq meters</option>
                  <option>10–100 sq meters</option>
                  <option>100–1000 sq meters</option>
                  <option>&gt; 1000 sq meters</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Reporter Email</label>
              <div class="form-input-icon">
                <span class="material-symbols-outlined">mail</span>
                <input class="form-input" type="email" placeholder="your@email.com (optional, for follow-up)">
              </div>
            </div>

            <div style="background:rgba(29,172,201,0.05);border:1px solid rgba(29,172,201,0.15);border-radius:var(--radius);padding:var(--space-4);font-size:0.8125rem;color:var(--color-slate-600);display:flex;gap:var(--space-3);align-items:flex-start">
              <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:1.125rem;flex-shrink:0;margin-top:2px">info</span>
              <span>Submitted reports are processed by our AI classification engine and correlated with satellite data. You may receive expert follow-up if your observation triggers an elevated risk alert.</span>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="width:100%">
              <span class="material-symbols-outlined" style="font-size:1.125rem">send</span> Submit Report to Detection Network
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
  ${renderFooter()}`;
}
