import { renderNavbar, initNavbarAuth } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { getUser, getSessionToken } from '../utils/auth.js';

export function renderProfile() {
  return {
    html: `
  ${renderNavbar('profile')}
  <main style="padding-top:var(--nav-height);min-height:80vh;background:var(--color-bg-light)">
    <!-- Header -->
    <section style="background:linear-gradient(135deg, #0d2818 0%, #060e08 40%, #0a1a0f 100%);padding:var(--space-16) 0 var(--space-12);position:relative;overflow:hidden">
      <!-- Animated ambient glows -->
      <div style="position:absolute;top:-80px;left:10%;width:350px;height:350px;border-radius:50%;background:radial-gradient(circle,rgba(74,222,128,0.08) 0%,transparent 70%);pointer-events:none;filter:blur(60px);animation:footer-orb-float 12s ease-in-out infinite"></div>
      <div style="position:absolute;bottom:-60px;right:8%;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(34,197,94,0.06) 0%,transparent 70%);pointer-events:none;filter:blur(60px);animation:footer-orb-float 16s ease-in-out 3s infinite reverse"></div>
      <!-- Subtle grid pattern overlay -->
      <div style="position:absolute;inset:0;background-image:radial-gradient(rgba(74,222,128,0.03) 1px,transparent 1px);background-size:24px 24px;pointer-events:none"></div>

      <div class="container" style="position:relative;z-index:2">
        <div style="display:flex;align-items:center;gap:var(--space-8);flex-wrap:wrap" class="profile-header-animate">
          <div id="profile-avatar" style="width:5.5rem;height:5.5rem;border-radius:50%;background:linear-gradient(135deg,#4ade80,#22c55e);color:#0a1a0f;display:flex;align-items:center;justify-content:center;font-size:2.25rem;font-weight:var(--fw-bold);border:3px solid rgba(74,222,128,0.3);box-shadow:0 0 30px rgba(74,222,128,0.2),0 8px 32px rgba(0,0,0,0.3);animation:profile-avatar-pulse 3s ease-in-out infinite">
            -
          </div>
          <div style="flex:1">
            <h1 id="profile-name" style="font-size:2rem;font-weight:var(--fw-bold);margin-bottom:var(--space-1);color:#f0f8f0;text-shadow:0 2px 10px rgba(0,0,0,0.3)">Loading...</h1>
            <p id="profile-email" style="color:rgba(74,222,128,0.6);margin-bottom:0.375rem;font-size:0.9rem"></p>
            <div style="display:flex;gap:1.25rem;color:rgba(200,230,210,0.55);font-size:0.875rem;margin-bottom:0.5rem">
                <span id="profile-gender"></span>
                <span id="profile-phone"></span>
            </div>
            <p id="profile-role" style="display:none"></p>
            <span id="profile-level-badge" style="display:none;margin-left:0.5rem;font-size:0.7rem;font-weight:var(--fw-bold);padding:0.2rem 0.6rem;border-radius:100px;letter-spacing:0.06em;text-transform:uppercase"></span>
          </div>
          <div>
            <button id="edit-profile-btn" class="btn mix-btn-primary" style="display:none;align-items:center;gap:0.5rem;background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.25);color:#4ade80;backdrop-filter:blur(8px);transition:all 0.3s ease">
              <span class="material-symbols-outlined">edit</span> Edit Profile
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Edit Profile Modal -->
    <div id="edit-profile-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);z-index:100;align-items:center;justify-content:center;padding:var(--space-4)">
      <div style="background:linear-gradient(135deg,#0d2818,#0a1a0f);width:100%;max-width:500px;border-radius:var(--radius-xl);box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 40px rgba(74,222,128,0.08);overflow:hidden;border:1px solid rgba(74,222,128,0.15);animation:profile-modal-enter 0.35s ease-out">
        <div style="padding:var(--space-6);border-bottom:1px solid rgba(74,222,128,0.1);display:flex;justify-content:space-between;align-items:center">
          <h2 style="margin:0;font-size:1.25rem;color:var(--color-slate-900)">Edit Profile</h2>
          <button id="edit-profile-cancel-xtop" style="background:none;border:none;color:var(--color-slate-500);cursor:pointer;transition:color 0.2s" onmouseover="this.style.color='#4ade80'" onmouseout="this.style.color=''"><span class="material-symbols-outlined">close</span></button>
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
            <button type="button" id="edit-profile-cancel" class="btn" style="background:rgba(74,222,128,0.08);color:var(--color-slate-600);border:1px solid rgba(74,222,128,0.1)">Cancel</button>
            <button type="submit" id="edit-profile-save" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>

    <section class="section" style="padding:var(--space-12) 0 var(--space-20)">
      <div class="container">
        
        <div id="profile-loader" style="text-align:center;padding:var(--space-12) 0;color:var(--color-slate-500)">
          <span class="material-symbols-outlined" style="font-size:2rem;animation:pulse-ring 1.5s infinite;color:var(--color-primary)">hourglass_empty</span>
          <p style="margin-top:var(--space-3)">Loading TerraPoints and History...</p>
        </div>

        <div id="profile-content" style="display:none;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:var(--space-8)">
          
          <!-- Left Column: Stats -->
          <div style="display:flex;flex-direction:column;gap:var(--space-6)">
            <div class="card profile-card-animate" style="padding:var(--space-8);text-align:center;background:linear-gradient(135deg,rgba(15,35,20,0.8),rgba(10,26,15,0.9));border:1px solid rgba(74,222,128,0.15);position:relative;overflow:hidden">
              <!-- Shimmer line -->
              <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(74,222,128,0.3),transparent);animation:profile-shimmer 3s ease-in-out infinite"></div>
              
              <span class="material-symbols-outlined" style="font-size:2.5rem;color:var(--color-primary);margin-bottom:var(--space-2);filter:drop-shadow(0 0 8px rgba(74,222,128,0.3))">toll</span>
              <h2 style="font-size:1rem;color:var(--color-slate-600);font-weight:var(--fw-medium);margin-bottom:var(--space-3);text-transform:uppercase;letter-spacing:0.08em">TerraPoints Balance</h2>
              
              <!-- Points with glow ring -->
              <div style="position:relative;display:inline-block;margin-bottom:var(--space-2)">
                <div id="profile-points" style="font-size:3.5rem;font-weight:var(--fw-bold);color:#4ade80;line-height:1;text-shadow:0 0 30px rgba(74,222,128,0.3)">0</div>
              </div>

              <!-- Level display -->
              <div id="level-display" style="display:none;margin-top:var(--space-5)">
                <div id="level-name" style="font-size:1rem;font-weight:var(--fw-bold);letter-spacing:0.04em;margin-bottom:var(--space-3)"></div>
                <div style="position:relative;height:8px;background:rgba(74,222,128,0.08);border-radius:4px;overflow:hidden;border:1px solid rgba(74,222,128,0.1)">
                  <div id="level-bar" style="position:absolute;left:0;top:0;height:100%;border-radius:4px;transition:width 1.2s cubic-bezier(0.4,0,0.2,1);background:linear-gradient(90deg,#22c55e,#4ade80);width:0%;box-shadow:0 0 12px rgba(74,222,128,0.4)"></div>
                </div>
                <div id="level-progress-label" style="font-size:0.75rem;color:var(--color-slate-500);margin-top:var(--space-2)"></div>
              </div>

              <p style="font-size:0.85rem;color:var(--color-slate-500);margin-top:var(--space-4);line-height:1.6">Earn points by submitting verified invasive species reports.</p>
            </div>

            <div class="card profile-card-animate" style="padding:var(--space-6);background:rgba(15,35,20,0.7);border:1px solid rgba(74,222,128,0.12);animation-delay:0.15s">
              <h3 style="font-size:1rem;border-bottom:1px solid rgba(74,222,128,0.1);padding-bottom:var(--space-3);margin-bottom:var(--space-4);color:var(--color-slate-900);font-weight:var(--fw-bold);display:flex;align-items:center;gap:var(--space-2)">
                <span class="material-symbols-outlined" style="font-size:1.125rem;color:var(--color-primary)">bar_chart</span>
                Contribution Stats
              </h3>
              <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-4);padding:var(--space-3);background:rgba(74,222,128,0.04);border-radius:var(--radius);border:1px solid rgba(74,222,128,0.06)">
                <span style="color:var(--color-slate-600);font-size:0.9rem">Total Reports</span>
                <strong id="profile-reports-count" style="color:var(--color-slate-900);font-size:1.125rem">0</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding:var(--space-3);background:rgba(74,222,128,0.04);border-radius:var(--radius);border:1px solid rgba(74,222,128,0.06)">
                <span style="color:var(--color-slate-600);font-size:0.9rem">Verified Reports</span>
                <strong id="profile-verified-count" style="color:var(--color-emerald);font-size:1.125rem">0</strong>
              </div>
            </div>
          </div>

          <!-- Right Column: History -->
          <div class="card profile-card-animate" style="padding:var(--space-8);background:rgba(15,35,20,0.6);border:1px solid rgba(74,222,128,0.12);animation-delay:0.3s">
            <h2 style="font-size:1.375rem;margin-bottom:var(--space-6);display:flex;align-items:center;gap:0.6rem;color:var(--color-slate-900)">
              <span class="material-symbols-outlined" style="color:var(--color-primary);filter:drop-shadow(0 0 6px rgba(74,222,128,0.3))">history</span> 
              TerraPoints History
            </h2>
            
            <div id="history-container" style="display:flex;flex-direction:column;gap:var(--space-3)">
              <!-- History items injected here -->
            </div>
          </div>

        </div>

      </div>
    </section>
  </main>
  
  <style>
    @keyframes profile-avatar-pulse {
      0%, 100% { box-shadow: 0 0 30px rgba(74,222,128,0.2), 0 8px 32px rgba(0,0,0,0.3); }
      50% { box-shadow: 0 0 40px rgba(74,222,128,0.35), 0 8px 32px rgba(0,0,0,0.3); }
    }
    @keyframes profile-shimmer {
      0% { transform: translateX(-100%); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateX(100%); opacity: 0; }
    }
    @keyframes profile-modal-enter {
      from { transform: scale(0.92) translateY(20px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }
    @keyframes profile-card-slidein {
      from { transform: translateY(24px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes profile-history-item {
      from { transform: translateX(-12px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .profile-header-animate {
      animation: profile-card-slidein 0.6s ease-out both;
    }
    .profile-card-animate {
      animation: profile-card-slidein 0.5s ease-out both;
    }
    .profile-history-item {
      animation: profile-history-item 0.4s ease-out both;
    }
    #edit-profile-btn:hover {
      background: rgba(74,222,128,0.2) !important;
      border-color: rgba(74,222,128,0.4) !important;
      box-shadow: 0 0 20px rgba(74,222,128,0.15);
      transform: translateY(-1px);
    }
  </style>
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

          // ── Level badge ─────────────────────────────────────────────────────
          const levelColors = {
            Observer: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
            Defender: { bg: 'rgba(74,222,128,0.15)', color: '#4ade80' },
            Protector: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
            Guardian: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
          };
          const level = data.profile.level || 'Observer';
          const lc = levelColors[level] || levelColors.Observer;
          const badge = document.getElementById('profile-level-badge');
          if (badge) {
            badge.textContent = level;
            badge.style.background = lc.bg;
            badge.style.color = lc.color;
            badge.style.border = `1px solid ${lc.color}40`;
            badge.style.display = 'inline-block';
          }

          // ── Progress bar ────────────────────────────────────────────────────
          const levelDisplay = document.getElementById('level-display');
          const levelNameEl = document.getElementById('level-name');
          const levelBar = document.getElementById('level-bar');
          const levelLabel = document.getElementById('level-progress-label');
          if (levelDisplay && levelNameEl && levelBar && levelLabel) {
            levelDisplay.style.display = 'block';
            levelNameEl.textContent = level;
            levelNameEl.style.color = lc.color;
            const pct = data.profile.level_progress_pct ?? 0;
            const nextAt = data.profile.next_level_at;
            requestAnimationFrame(() => {
              levelBar.style.width = pct + '%';
            });
            if (nextAt) {
              const pts = data.profile.terra_points;
              levelLabel.textContent = `${nextAt - pts} pts to next level`;
            } else {
              levelLabel.textContent = 'Max level reached 🌟';
            }
          }

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

          // Animate points counter with easing
          const pointsEl = document.getElementById('profile-points');
          const targetPoints = data.profile.terra_points;
          let currentPoints = 0;
          const duration = 1200;
          const start = performance.now();

          const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

          const animatePoints = (time) => {
            const rawProgress = Math.min((time - start) / duration, 1);
            const progress = easeOutCubic(rawProgress);
            currentPoints = Math.floor(progress * targetPoints);
            pointsEl.textContent = currentPoints.toLocaleString();
            if (rawProgress < 1) requestAnimationFrame(animatePoints);
            else pointsEl.textContent = targetPoints.toLocaleString();
          };
          requestAnimationFrame(animatePoints);

          document.getElementById('profile-reports-count').textContent = data.profile.reports_count;
          document.getElementById('profile-verified-count').textContent = data.profile.verified_reports;

          // Render History with staggered animations
          const historyContainer = document.getElementById('history-container');
          if (data.history && data.history.length > 0) {
            historyContainer.innerHTML = data.history.map((item, idx) => `
                          <div class="profile-history-item" style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4) var(--space-5);border:1px solid rgba(74,222,128,0.1);border-radius:var(--radius-lg);background:rgba(15,35,20,0.5);backdrop-filter:blur(4px);transition:all 0.3s ease;animation-delay:${idx * 0.08}s;cursor:default" onmouseover="this.style.borderColor='rgba(74,222,128,0.25)';this.style.background='rgba(15,35,20,0.7)';this.style.transform='translateX(4px)'" onmouseout="this.style.borderColor='rgba(74,222,128,0.1)';this.style.background='rgba(15,35,20,0.5)';this.style.transform='translateX(0)'">
                            <div>
                              <div style="font-weight:var(--fw-bold);color:var(--color-slate-900);margin-bottom:0.25rem;font-size:0.95rem">${item.reason}</div>
                              <div style="font-size:0.7rem;color:var(--color-slate-500)">${new Date(item.created_at).toLocaleString()}</div>
                            </div>
                            <div style="font-weight:var(--fw-bold);font-size:1.125rem;color:${item.amount > 0 ? '#4ade80' : 'var(--color-red)'};text-shadow:0 0 12px ${item.amount > 0 ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.2)'}">
                              ${item.amount > 0 ? '+' : ''}${item.amount} TP
                            </div>
                          </div>
                        `).join('');
          } else {
            historyContainer.innerHTML = `
                          <div style="padding:var(--space-8);text-align:center;color:var(--color-slate-500);background:rgba(15,35,20,0.4);border-radius:var(--radius-lg);border:1px dashed rgba(74,222,128,0.15)">
                            <span class="material-symbols-outlined" style="font-size:2rem;opacity:0.4;margin-bottom:var(--space-2);display:block;color:var(--color-primary)">receipt_long</span>
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
