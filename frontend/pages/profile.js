import { renderNavbar, initNavbarAuth } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { getUser, getSessionToken } from '../utils/auth.js';

export function renderProfile() {
  return {
    html: `
  ${renderNavbar('profile')}
  <main style="padding-top:var(--nav-height);min-height:80vh;background:var(--color-bg-light)">
    <!-- Header -->
    <section style="background:var(--color-slate-900);padding:var(--space-12) 0;color:white;position:relative;overflow:hidden">
      <div class="container" style="position:relative;z-index:2">
        <div style="display:flex;align-items:center;gap:var(--space-6);flex-wrap:wrap">
          <div id="profile-avatar" style="width:5rem;height:5rem;border-radius:50%;background:var(--color-primary);color:white;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:var(--fw-bold);border:4px solid rgba(255,255,255,0.2)">
            -
          </div>
          <div style="flex:1">
            <h1 id="profile-name" style="font-size:2rem;font-weight:var(--fw-bold);margin-bottom:var(--space-1)">Loading...</h1>
            <p id="profile-email" style="color:var(--color-primary-30);margin-bottom:0.25rem"></p>
            <div style="display:flex;gap:1rem;color:var(--color-slate-300);font-size:0.875rem;margin-bottom:0.5rem">
                <span id="profile-gender"></span>
                <span id="profile-phone"></span>
            </div>
            <p id="profile-role" style="text-transform:uppercase;letter-spacing:0.05em;font-size:0.75rem;font-weight:var(--fw-bold);display:inline-block;padding:0.25rem 0.5rem;background:var(--color-primary);border-radius:100px">Observer</p>
          </div>
          <div>
            <button id="edit-profile-btn" class="btn mix-btn-primary" style="display:none;align-items:center;gap:0.5rem">
              <span class="material-symbols-outlined">edit</span> Edit Profile
            </button>
          </div>
        </div>
      </div>
      <!-- Decorative BG -->
      <svg style="position:absolute;top:0;right:0;width:50%;height:100%;opacity:0.05;pointer-events:none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,100 Q50,0 100,100 Z" fill="#fff"/>
      </svg>
    </section>

    <!-- Edit Profile Modal -->
    <div id="edit-profile-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100;align-items:center;justify-content:center;padding:var(--space-4)">
      <div style="background:var(--color-bg-light);width:100%;max-width:500px;border-radius:var(--radius-lg);box-shadow:var(--shadow-xl);overflow:hidden">
        <div style="padding:var(--space-6);border-bottom:1px solid var(--color-slate-200);display:flex;justify-content:space-between;align-items:center">
          <h2 style="margin:0;font-size:1.25rem">Edit Profile</h2>
          <button id="edit-profile-cancel-xtop" style="background:none;border:none;color:var(--color-slate-500);cursor:pointer"><span class="material-symbols-outlined">close</span></button>
        </div>
        <form id="edit-profile-form" style="padding:var(--space-6);display:flex;flex-direction:column;gap:var(--space-4)">
          <div class="form-group">
            <label class="form-label" for="edit-name">Full Name</label>
            <input type="text" id="edit-name" name="name" class="form-input" placeholder="Your name">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
            <div class="form-group">
              <label class="form-label" for="edit-gender">Gender</label>
              <select id="edit-gender" name="gender" class="form-input">
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="edit-phone">Phone Number</label>
              <input type="tel" id="edit-phone" name="phone" class="form-input" placeholder="+1 (555) 000-0000">
            </div>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:var(--space-3);margin-top:var(--space-4)">
            <button type="button" id="edit-profile-cancel" class="btn" style="background:var(--color-slate-200);color:var(--color-slate-700)">Cancel</button>
            <button type="submit" id="edit-profile-save" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>

    <section class="section">
      <div class="container">
        
        <div id="profile-loader" style="text-align:center;padding:var(--space-12) 0;color:var(--color-slate-500)">
          <span class="material-symbols-outlined" style="font-size:2rem;animation:pulse-ring 1.5s infinite">hourglass_empty</span>
          <p style="margin-top:var(--space-3)">Loading TerraPoints and History...</p>
        </div>

        <div id="profile-content" style="display:none;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:var(--space-8)">
          
          <!-- Left Column: Stats -->
          <div style="display:flex;flex-direction:column;gap:var(--space-6)">
            <div class="card" style="padding:var(--space-8);text-align:center;background:linear-gradient(135deg, var(--color-primary-10), rgba(29,172,201,0.02));border:1px solid rgba(29,172,201,0.2)">
              <span class="material-symbols-outlined" style="font-size:2.5rem;color:var(--color-primary);margin-bottom:var(--space-2)">toll</span>
              <h2 style="font-size:1.125rem;color:var(--color-slate-600);font-weight:normal;margin-bottom:var(--space-2)">TerraPoints Balance</h2>
              <div id="profile-points" style="font-size:3.5rem;font-weight:var(--fw-bold);color:var(--color-primary);line-height:1">0</div>
              <p style="font-size:0.875rem;color:var(--color-slate-500);margin-top:var(--space-4)">Earn points by submitting verified invasive species reports.</p>
            </div>

            <div class="card" style="padding:var(--space-6)">
              <h3 style="font-size:1.125rem;border-bottom:1px solid var(--color-slate-200);padding-bottom:var(--space-3);margin-bottom:var(--space-4)">Contribution Stats</h3>
              <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-3)">
                <span style="color:var(--color-slate-600)">Total Reports</span>
                <strong id="profile-reports-count">0</strong>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:var(--color-slate-600)">Verified Reports</span>
                <strong id="profile-verified-count" style="color:var(--color-emerald)">0</strong>
              </div>
            </div>
          </div>

          <!-- Right Column: History -->
          <div class="card" style="padding:var(--space-8)">
            <h2 style="font-size:1.5rem;margin-bottom:var(--space-6);display:flex;align-items:center;gap:0.5rem">
              <span class="material-symbols-outlined" style="color:var(--color-primary)">history</span> 
              TerraPoints History
            </h2>
            
            <div id="history-container" style="display:flex;flex-direction:column;gap:var(--space-4)">
              <!-- History items injected here -->
            </div>
          </div>

        </div>

      </div>
    </section>
  </main>
  ${renderFooter()}`,

    async init() {
      initNavbarAuth();
      const user = await getUser();

      if (!user) {
        window.location.hash = '#/login';
        return;
      }

      // Update Header immediately with Auth Data as fallback
      const nameEl = document.getElementById('profile-name');
      const emailEl = document.getElementById('profile-email');
      const avatarEl = document.getElementById('profile-avatar');
      nameEl.textContent = user.email.split('@')[0];
      emailEl.textContent = user.email;
      avatarEl.textContent = user.email.charAt(0).toUpperCase();

      // Fetch Profile & History from Backend
      try {
        const token = await getSessionToken();
        const res = await fetch('/api/user-profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Failed to load profile data');
        const data = await res.json();

        if (data.success && data.profile) {
          // Hide loader, show content
          document.getElementById('profile-loader').style.display = 'none';
          document.getElementById('profile-content').style.display = 'grid';

          // Update Stats
          document.getElementById('profile-role').textContent = data.profile.role.toUpperCase();

          if (data.profile.name) nameEl.textContent = data.profile.name;
          if (data.profile.gender) document.getElementById('profile-gender').innerHTML = `<span class="material-symbols-outlined" style="font-size:1rem;vertical-align:middle;margin-right:0.25rem">wc</span>${data.profile.gender}`;
          if (data.profile.phone) document.getElementById('profile-phone').innerHTML = `<span class="material-symbols-outlined" style="font-size:1rem;vertical-align:middle;margin-right:0.25rem">call</span>${data.profile.phone}`;

          // Populate forms
          const editBtn = document.getElementById('edit-profile-btn');
          const editModal = document.getElementById('edit-profile-modal');
          const cancelBtn = document.getElementById('edit-profile-cancel');
          const cancelXBtn = document.getElementById('edit-profile-cancel-xtop');
          const editForm = document.getElementById('edit-profile-form');
          const saveBtn = document.getElementById('edit-profile-save');

          editBtn.style.display = 'flex';
          if (data.profile.name) document.getElementById('edit-name').value = data.profile.name;
          if (data.profile.gender) document.getElementById('edit-gender').value = data.profile.gender;
          if (data.profile.phone) document.getElementById('edit-phone').value = data.profile.phone;

          const closeModal = () => { editModal.style.display = 'none'; };
          editBtn.addEventListener('click', () => { editModal.style.display = 'flex'; });
          cancelBtn.addEventListener('click', closeModal);
          cancelXBtn.addEventListener('click', closeModal);

          editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            const formData = new FormData(editForm);
            const payload = {
              name: formData.get('name') || '',
              gender: formData.get('gender') || '',
              phone: formData.get('phone') || ''
            };

            try {
              const res = await fetch('/api/edit-profile', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              });

              if (res.ok) {
                window.location.reload();
              } else {
                const errData = await res.json();
                alert('Error: ' + (errData.error || 'Failed to save profile.'));
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Changes';
              }
            } catch (e) {
              console.error("Save error", e);
              alert("Failed to reach server to save profile.");
              saveBtn.disabled = false;
              saveBtn.textContent = 'Save Changes';
            }
          });

          // Animate points counter natively
          const pointsEl = document.getElementById('profile-points');
          const targetPoints = data.profile.terra_points;
          let currentPoints = 0;
          const duration = 1000;
          const start = performance.now();

          const animatePoints = (time) => {
            const progress = Math.min((time - start) / duration, 1);
            currentPoints = Math.floor(progress * targetPoints);
            pointsEl.textContent = currentPoints;
            if (progress < 1) requestAnimationFrame(animatePoints);
            else pointsEl.textContent = targetPoints; // Ensure strict final
          };
          requestAnimationFrame(animatePoints);

          document.getElementById('profile-reports-count').textContent = data.profile.reports_count;
          document.getElementById('profile-verified-count').textContent = data.profile.verified_reports;

          // Render History
          const historyContainer = document.getElementById('history-container');
          if (data.history && data.history.length > 0) {
            historyContainer.innerHTML = data.history.map(item => `
                          <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4);border:1px solid var(--color-slate-200);border-radius:var(--radius);background:#fff">
                            <div>
                              <div style="font-weight:var(--fw-bold);color:var(--color-slate-800);margin-bottom:0.25rem">${item.reason}</div>
                              <div style="font-size:0.75rem;color:var(--color-slate-500)">${new Date(item.created_at).toLocaleString()}</div>
                            </div>
                            <div style="font-weight:var(--fw-bold);font-size:1.125rem;color:${item.amount > 0 ? 'var(--color-emerald)' : 'var(--color-red)'}">
                              ${item.amount > 0 ? '+' : ''}${item.amount} TP
                            </div>
                          </div>
                        `).join('');
          } else {
            historyContainer.innerHTML = `
                          <div style="padding:var(--space-8);text-align:center;color:var(--color-slate-500);background:var(--color-slate-50);border-radius:var(--radius);border:1px dashed var(--color-slate-300)">
                            <span class="material-symbols-outlined" style="font-size:2rem;opacity:0.5;margin-bottom:var(--space-2);display:block">receipt_long</span>
                            No TerraPoints history yet. Submit a report to earn points!
                          </div>
                        `;
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        document.getElementById('profile-loader').innerHTML = `
                  <span class="material-symbols-outlined" style="font-size:2rem;color:var(--color-red)">error</span>
                  <p style="color:var(--color-red)">Could not load profile data. Please refresh.</p>
                `;
      }
    }
  };
}
