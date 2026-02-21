// Signup Page – Paper-Cut Landscape Theme + Real Supabase Auth
import { renderNavbar, initNavbarAuth } from '../components/navbar.js';
import { signUp, getUser } from '../utils/auth.js';

export function renderSignup() {
  return {
    html: `
  ${renderNavbar('signup')}
  <div style="min-height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden;background:linear-gradient(180deg,#e0f2f1 0%,#e8f5f3 30%,#f0f8f6 60%,#fdfbf7 100%)">

    <!-- Mountains & scenery -->
    <div style="position:absolute;inset:0;pointer-events:none;z-index:0">
      <!-- Sun -->
      <div style="position:absolute;top:2rem;left:12%;z-index:1">
        <svg width="90" height="90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="38" fill="#ffecb3" opacity="0.8"/>
          <circle cx="70" cy="70" r="50" fill="none" stroke="rgba(255,236,179,0.2)" stroke-width="1" style="animation:pulse-ring 4s ease-in-out infinite"/>
        </svg>
      </div>
      <!-- Clouds -->
      <svg style="position:absolute;top:8%;right:-10%;opacity:0.45;animation:drift-left 55s linear infinite" width="150" height="50" viewBox="0 0 160 60">
        <ellipse cx="80" cy="35" rx="65" ry="18" fill="#fff" opacity="0.8"/>
        <ellipse cx="110" cy="30" rx="30" ry="12" fill="#fff" opacity="0.5"/>
      </svg>
      <svg style="position:absolute;top:14%;left:-8%;opacity:0.3;animation:drift-right 48s linear 2s infinite" width="110" height="40" viewBox="0 0 120 50">
        <ellipse cx="60" cy="28" rx="50" ry="16" fill="#fff" opacity="0.7"/>
      </svg>
      <!-- Mountain layers -->
      <svg style="position:absolute;bottom:0;width:100%;z-index:1" preserveAspectRatio="none" viewBox="0 0 1440 320" height="50%">
        <path d="M0,192L80,181.3C160,171,320,149,480,165.3C640,181,800,235,960,245.3C1120,256,1280,224,1360,208L1440,192L1440,320L0,320Z" fill="#c8d5c3" opacity="0.5"/>
      </svg>
      <svg style="position:absolute;bottom:0;width:100%;z-index:2" preserveAspectRatio="none" viewBox="0 0 1440 320" height="38%">
        <path d="M0,224L60,213.3C120,203,240,181,360,192C480,203,600,245,720,250.7C840,256,960,224,1080,202.7C1200,181,1320,171,1380,165.3L1440,160L1440,320L0,320Z" fill="rgba(194,163,142,0.35)"/>
      </svg>
      <svg style="position:absolute;bottom:0;width:100%;z-index:3" preserveAspectRatio="none" viewBox="0 0 1440 320" height="25%">
        <path d="M0,256L48,250.7C96,245,192,235,288,229.3C384,224,480,224,576,234.7C672,245,768,267,864,261.3C960,256,1056,224,1152,218.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L0,320Z" fill="#4a5d4e" opacity="0.7"/>
      </svg>
      <!-- Particles -->
      <div id="signup-particles" style="position:absolute;inset:0;pointer-events:none;z-index:4"></div>
    </div>

    <!-- Content -->
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;position:relative;z-index:10;padding:var(--space-8) var(--space-4);overflow-y:auto">

      <!-- Logo -->
      <a href="#/" class="hero-animate" style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-6);text-decoration:none;flex-shrink:0">
        <svg class="ts-logo" width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="shield-grad-signup" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1dacc9"/><stop offset="100%" stop-color="#2d5a4c"/></linearGradient></defs>
          <path d="M50 8 L88 28 L88 52 C88 74 72 90 50 96 C28 90 12 74 12 52 L12 28 Z" fill="url(#shield-grad-signup)" opacity="0.9">
            <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite"/>
          </path>
          <path d="M50 30 C50 30 36 44 36 56 C36 64 42 70 50 70 C58 70 64 64 64 56 C64 44 50 30 50 30Z" fill="#fff" opacity="0.9"/>
        </svg>
        <span style="font-size:1.375rem;font-weight:var(--fw-bold);color:var(--color-slate-800);letter-spacing:-0.02em">TerraShield</span>
      </a>

      <!-- Header -->
      <div class="hero-animate" style="text-align:center;margin-bottom:var(--space-6);flex-shrink:0">
        <h1 class="font-serif" style="font-size:clamp(1.5rem,4vw,2.25rem);font-weight:var(--fw-bold);color:var(--color-slate-800);margin-bottom:var(--space-2)">Join the Detection Network</h1>
        <p style="color:var(--color-slate-500);font-size:0.875rem">Create your account to start reporting invasive species.</p>
      </div>

      <!-- Card -->
      <div class="hero-animate-delay" style="width:100%;max-width:26rem;background:rgba(255,255,255,0.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:var(--radius-xl);box-shadow:0 8px 32px rgba(0,0,0,0.08);border:1px solid rgba(255,255,255,0.6);padding:var(--space-8);flex-shrink:0">

        <!-- Error / success banner -->
        <div id="signup-msg" style="display:none;margin-bottom:var(--space-5);padding:var(--space-3) var(--space-4);border-radius:var(--radius);font-size:0.8125rem;text-align:center"></div>

        <form id="signup-form" style="display:flex;flex-direction:column;gap:var(--space-5)">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <div class="form-input-icon">
              <span class="material-symbols-outlined">person</span>
              <input class="form-input" id="signup-name" type="text" placeholder="Jane Doe" required style="background:rgba(255,255,255,0.6)">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <div class="form-input-icon">
              <span class="material-symbols-outlined">mail</span>
              <input class="form-input" id="signup-email" type="email" placeholder="you@example.com" required style="background:rgba(255,255,255,0.6)">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="form-input-icon">
                <span class="material-symbols-outlined">lock</span>
                <input class="form-input" id="signup-password" type="password" placeholder="••••••••" required minlength="6" style="background:rgba(255,255,255,0.6)">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Confirm</label>
              <div class="form-input-icon">
                <span class="material-symbols-outlined">verified_user</span>
                <input class="form-input" id="signup-confirm" type="password" placeholder="••••••••" required minlength="6" style="background:rgba(255,255,255,0.6)">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Role</label>
            <select class="form-input" id="signup-role" style="background:rgba(255,255,255,0.6)">
              <option value="">Select your role...</option>
              <option>Citizen Scientist</option>
              <option>Researcher / Ecologist</option>
              <option>Government Agency</option>
              <option>Environmental NGO</option>
            </select>
          </div>

          <div class="form-checkbox">
            <input type="checkbox" id="terms" required>
            <label for="terms" style="font-size:0.8125rem">I agree to the <a href="#" style="color:var(--color-primary);font-weight:var(--fw-bold)">Terms</a> and <a href="#" style="color:var(--color-primary);font-weight:var(--fw-bold)">Privacy Policy</a></label>
          </div>

          <button id="signup-btn" type="submit" class="btn btn-primary" style="width:100%;padding:var(--space-3) var(--space-4)">
            <span class="material-symbols-outlined" style="font-size:1.125rem">person_add</span>
            <span id="signup-btn-text">Create Account</span>
          </button>

          <p style="text-align:center;font-size:0.8125rem;color:var(--color-slate-500)">Already have an account? <a href="#/login" style="font-weight:var(--fw-bold);color:var(--color-primary)">Sign In</a></p>
        </form>
      </div>

      <!-- Trust badges -->
      <div class="hero-animate-delay-2" style="display:flex;justify-content:center;gap:var(--space-8);margin-top:var(--space-6);flex-shrink:0">
        <span style="display:flex;align-items:center;gap:var(--space-2);font-size:0.65rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.08em;color:var(--color-slate-400)">
          <span class="material-symbols-outlined" style="font-size:0.875rem;color:var(--color-primary)">shield</span> Secure &amp; Encrypted
        </span>
        <span style="display:flex;align-items:center;gap:var(--space-2);font-size:0.65rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.08em;color:var(--color-slate-400)">
          <span class="material-symbols-outlined" style="font-size:0.875rem;color:var(--color-primary)">public</span> Global Network
        </span>
      </div>

      <div class="hero-animate-delay-2" style="margin-top:var(--space-6);text-align:center;flex-shrink:0">
        <p style="font-size:0.65rem;color:var(--color-slate-400);text-transform:uppercase;letter-spacing:0.1em">&copy; 2025 TerraShield · Privacy · Terms</p>
      </div>
    </div>
  </div>`,

    async init() {
      // Redirect if already signed in
      const user = await getUser();
      if (user) { window.location.hash = '#/'; return; }

      // Particles
      const c = document.getElementById('signup-particles');
      if (c) {
        const symbols = ['🍃', '🌿', '•', '✦'];
        for (let i = 0; i < 10; i++) {
          const p = document.createElement('span');
          p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
          p.style.cssText = 'position:absolute;font-size:' + (7 + Math.random() * 7) + 'px;opacity:0.12;animation:particle-float ' + (6 + Math.random() * 6) + 's ease-in-out ' + (Math.random() * 4) + 's infinite;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 55) + '%;pointer-events:none';
          c.appendChild(p);
        }
      }

      // Form submit
      document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        const btn = document.getElementById('signup-btn');
        const btnText = document.getElementById('signup-btn-text');
        const msg = document.getElementById('signup-msg');

        // Client-side password match check
        if (password !== confirm) {
          msg.style.display = 'block';
          msg.style.background = 'var(--color-red-50)';
          msg.style.color = 'var(--color-red)';
          msg.style.border = '1px solid rgba(239,68,68,0.2)';
          msg.textContent = 'Passwords do not match.';
          return;
        }

        btn.disabled = true;
        btnText.textContent = 'Creating account…';
        msg.style.display = 'none';

        const name = document.getElementById('signup-name').value.trim();
        const { error } = await signUp(email, password, name);

        if (error) {
          msg.style.display = 'block';
          msg.style.background = 'var(--color-red-50)';
          msg.style.color = 'var(--color-red)';
          msg.style.border = '1px solid rgba(239,68,68,0.2)';
          msg.textContent = error.message;
          btn.disabled = false;
          btnText.textContent = 'Create Account';
        } else {
          msg.style.display = 'block';
          msg.style.background = 'var(--color-emerald-50)';
          msg.style.color = 'var(--color-emerald)';
          msg.style.border = '1px solid rgba(16,185,129,0.2)';
          msg.textContent = '✓ Account created! Check your email to confirm, then sign in.';
          btn.disabled = false;
          btnText.textContent = 'Create Account';
          // Redirect to login after 3s
          setTimeout(() => { window.location.hash = '#/login'; }, 3000);
        }
      });

      initNavbarAuth();
    }
  };
}
