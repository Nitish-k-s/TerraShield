// Login Page – Paper-Cut Landscape Theme + Playful Interactive Effects
import { renderNavbar, initNavbarAuth } from '../components/navbar.js';
import { signIn, getUser } from '../utils/auth.js';
import { initCardTilt, initReactiveOrbs, initCursorSpotlight } from '../utils/auth-effects.js';

export function renderLogin() {
  return {
    html: `
  ${renderNavbar('login')}
  <div id="login-page" style="min-height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden;background:linear-gradient(180deg,#060e08 0%,#0a1a0f 30%,#0d2818 60%,#0a1a0f 100%)">

    <!-- Mountains & scenery -->
    <div id="login-scenery" style="position:absolute;inset:0;pointer-events:none;z-index:0">
      <!-- Subtle grid pattern overlay -->
      <div style="position:absolute;inset:0;background-image:radial-gradient(rgba(74,222,128,0.03) 1px,transparent 1px);background-size:24px 24px;pointer-events:none;z-index:0"></div>
      <!-- Moon glow -->
      <div style="position:absolute;top:2.5rem;right:15%;z-index:1">
        <svg width="100" height="100" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="30" fill="rgba(220,240,220,0.15)" opacity="0.8"/>
          <circle cx="70" cy="70" r="45" fill="none" stroke="rgba(74,222,128,0.08)" stroke-width="1" style="animation:pulse-ring 4s ease-in-out infinite"/>
          <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(74,222,128,0.04)" stroke-width="1" style="animation:pulse-ring 4s ease-in-out 1s infinite"/>
        </svg>
      </div>

      <!-- Mist / fog clouds dark -->
      <svg style="position:absolute;top:10%;left:-5%;opacity:0.12;animation:drift-right 50s linear infinite" width="140" height="50" viewBox="0 0 160 60">
        <ellipse cx="80" cy="35" rx="65" ry="18" fill="rgba(74,222,128,0.2)" opacity="0.8"/>
        <ellipse cx="55" cy="30" rx="35" ry="14" fill="rgba(74,222,128,0.15)" opacity="0.6"/>
      </svg>
      <svg style="position:absolute;top:5%;right:0;opacity:0.08;animation:drift-left 60s linear 3s infinite" width="100" height="40" viewBox="0 0 120 50">
        <ellipse cx="60" cy="28" rx="50" ry="16" fill="rgba(74,222,128,0.2)" opacity="0.7"/>
      </svg>

      <!-- Dark mountain silhouettes -->
      <svg style="position:absolute;bottom:0;width:100%;z-index:1" preserveAspectRatio="none" viewBox="0 0 1440 320" height="55%">
        <path d="M0,192L80,181.3C160,171,320,149,480,165.3C640,181,800,235,960,245.3C1120,256,1280,224,1360,208L1440,192L1440,320L0,320Z" fill="#061208" opacity="0.9"/>
      </svg>
      <svg style="position:absolute;bottom:0;width:100%;z-index:2" preserveAspectRatio="none" viewBox="0 0 1440 320" height="42%">
        <path d="M0,224L60,213.3C120,203,240,181,360,192C480,203,600,245,720,250.7C840,256,960,224,1080,202.7C1200,181,1320,171,1380,165.3L1440,160L1440,320L0,320Z" fill="rgba(10,25,15,0.6)"/>
      </svg>
      <svg style="position:absolute;bottom:0;width:100%;z-index:3" preserveAspectRatio="none" viewBox="0 0 1440 320" height="28%">
        <path d="M0,256L48,250.7C96,245,192,235,288,229.3C384,224,480,224,576,234.7C672,245,768,267,864,261.3C960,256,1056,224,1152,218.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L0,320Z" fill="#0a1a0f" opacity="1"/>
      </svg>

      <!-- Birds -->
      <svg style="position:absolute;top:6%;left:20%;z-index:6;opacity:0.55;animation:bird-fly 16s ease-in-out infinite" width="55" height="20" viewBox="0 0 50 20">
        <path d="M0,10 Q12,0 25,10 Q38,0 50,10" fill="none" stroke="#3a5a2a" stroke-width="2.5" stroke-linecap="round"><animate attributeName="d" values="M0,10 Q12,0 25,10 Q38,0 50,10;M0,10 Q12,6 25,10 Q38,6 50,10;M0,10 Q12,0 25,10 Q38,0 50,10" dur="0.5s" repeatCount="indefinite"/></path>
      </svg>
      <svg style="position:absolute;top:4%;left:50%;z-index:6;opacity:0.4;animation:bird-fly 20s ease-in-out 3s infinite" width="45" height="17" viewBox="0 0 50 20">
        <path d="M0,10 Q12,0 25,10 Q38,0 50,10" fill="none" stroke="#4a6a3a" stroke-width="2.5" stroke-linecap="round"><animate attributeName="d" values="M0,10 Q12,0 25,10 Q38,0 50,10;M0,10 Q12,6 25,10 Q38,6 50,10;M0,10 Q12,0 25,10 Q38,0 50,10" dur="0.55s" repeatCount="indefinite"/></path>
      </svg>

      <!-- Butterfly -->
      <svg style="position:absolute;top:10%;left:65%;z-index:6;opacity:0.5;animation:bird-fly 24s ease-in-out 5s infinite" width="45" height="36" viewBox="0 0 50 40">
        <ellipse cx="15" cy="16" rx="12" ry="9" fill="#e8a040" opacity="0.8"><animate attributeName="ry" values="9;3;9" dur="0.4s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="35" cy="16" rx="12" ry="9" fill="#e8a040" opacity="0.8"><animate attributeName="ry" values="9;3;9" dur="0.4s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="15" cy="24" rx="8" ry="6" fill="#d08030" opacity="0.6"><animate attributeName="ry" values="6;2;6" dur="0.4s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="35" cy="24" rx="8" ry="6" fill="#d08030" opacity="0.6"><animate attributeName="ry" values="6;2;6" dur="0.4s" repeatCount="indefinite"/></ellipse>
        <line x1="25" y1="8" x2="25" y2="32" stroke="#5a3a1a" stroke-width="1.5"/>
        <circle cx="25" cy="16" r="2" fill="#5a3a1a"/>
      </svg>

      <!-- Large wildflower cluster (left) -->
      <svg style="position:absolute;bottom:25%;left:2%;z-index:6;opacity:0.6;pointer-events:none" width="120" height="100" viewBox="0 0 120 100">
        <line x1="15" y1="100" x2="12" y2="40" stroke="#4a7a3a" stroke-width="2.5"/>
        <line x1="12" y1="55" x2="3" y2="42" stroke="#4a7a3a" stroke-width="1.5"/>
        <circle cx="3" cy="37" r="5" fill="#7ab350" opacity="0.6"/>
        <circle cx="12" cy="30" r="10" fill="#e87ca0" opacity="0.7"/><circle cx="12" cy="30" r="5" fill="#f0c060" opacity="0.8"/>
        <line x1="50" y1="100" x2="52" y2="35" stroke="#4a7a3a" stroke-width="2.5"/>
        <circle cx="52" cy="25" r="12" fill="#c86090" opacity="0.6"/><circle cx="52" cy="25" r="6" fill="#f0c060" opacity="0.7"/>
        <line x1="85" y1="100" x2="82" y2="42" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="82" cy="32" r="9" fill="#e8a040" opacity="0.7"/><circle cx="82" cy="32" r="4.5" fill="#f0d080" opacity="0.8"/>
        <line x1="108" y1="100" x2="106" y2="50" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="106" cy="42" r="7" fill="#d070b0" opacity="0.6"/><circle cx="106" cy="42" r="3.5" fill="#f0b060" opacity="0.7"/>
      </svg>

      <!-- Large wildflower cluster (right) -->
      <svg style="position:absolute;bottom:28%;right:3%;z-index:6;opacity:0.55;pointer-events:none" width="100" height="85" viewBox="0 0 100 85">
        <line x1="15" y1="85" x2="13" y2="32" stroke="#4a7a3a" stroke-width="2.5"/>
        <circle cx="13" cy="22" r="11" fill="#d070b0" opacity="0.7"/><circle cx="13" cy="22" r="5.5" fill="#f0b060" opacity="0.8"/>
        <line x1="48" y1="85" x2="50" y2="28" stroke="#4a7a3a" stroke-width="2.5"/>
        <circle cx="50" cy="18" r="12" fill="#e87ca0" opacity="0.7"/><circle cx="50" cy="18" r="6" fill="#f0c060" opacity="0.8"/>
        <line x1="80" y1="85" x2="78" y2="36" stroke="#4a7a3a" stroke-width="2"/>
        <circle cx="78" cy="27" r="9" fill="#e8a040" opacity="0.6"/><circle cx="78" cy="27" r="4.5" fill="#f0d080" opacity="0.8"/>
      </svg>

      <!-- Fireflies -->
      <div style="position:absolute;top:15%;left:35%;width:4px;height:4px;background:#4ade80;border-radius:50%;filter:blur(2px);animation:firefly-float 6s ease-in-out infinite;opacity:0.5"></div>
      <div style="position:absolute;top:22%;right:28%;width:3px;height:3px;background:#4ade80;border-radius:50%;filter:blur(2px);animation:firefly-float 8s ease-in-out 2s infinite;opacity:0.4"></div>
      <div style="position:absolute;top:10%;left:55%;width:3px;height:3px;background:#22c55e;border-radius:50%;filter:blur(1px);animation:firefly-float 7s ease-in-out 4s infinite;opacity:0.3"></div>

      <!-- Reactive orbs container -->
      <div id="login-orbs" style="position:absolute;inset:0;pointer-events:none;z-index:4"></div>
    </div>

    <!-- Content -->
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;z-index:10;padding:var(--space-8) var(--space-4)">

      <!-- Logo -->
      <a href="#/" class="hero-animate" style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-8);text-decoration:none">
        <svg class="ts-logo" width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="shield-grad-login" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4ade80"/><stop offset="100%" stop-color="#22c55e"/></linearGradient></defs>
          <path d="M50 8 L88 28 L88 52 C88 74 72 90 50 96 C28 90 12 74 12 52 L12 28 Z" fill="url(#shield-grad-login)" opacity="0.9">
            <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite"/>
          </path>
          <path d="M50 30 C50 30 36 44 36 56 C36 64 42 70 50 70 C58 70 64 64 64 56 C64 44 50 30 50 30Z" fill="#fff" opacity="0.9"/>
        </svg>
        <span style="font-size:1.375rem;font-weight:var(--fw-bold);color:#f0f8f0;letter-spacing:-0.02em">TerraShield</span>
      </a>

      <!-- Card with 3D tilt -->
      <div id="login-card" class="hero-animate-delay" style="width:100%;max-width:24rem;background:rgba(15,35,20,0.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:var(--radius-xl);box-shadow:0 8px 40px rgba(0,0,0,0.5),0 0 80px rgba(74,222,128,0.04);border:1px solid rgba(74,222,128,0.15);padding:var(--space-10);position:relative;overflow:hidden">
        <!-- Shimmer line -->
        <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(74,222,128,0.3),transparent);animation:login-shimmer 3s ease-in-out infinite"></div>
        <div style="text-align:center;margin-bottom:var(--space-8)">
          <h2 class="font-serif" style="font-size:1.5rem;font-weight:var(--fw-bold);color:#f0f8f0">Welcome Back</h2>
          <p style="color:var(--color-slate-500);margin-top:var(--space-2);font-size:0.8125rem">Sign in to the TerraShield detection network.</p>
        </div>

        <!-- Error / success banner -->
        <div id="login-msg" style="display:none;margin-bottom:var(--space-5);padding:var(--space-3) var(--space-4);border-radius:var(--radius);font-size:0.8125rem;text-align:center"></div>

        <form id="login-form" style="display:flex;flex-direction:column;gap:var(--space-5)">
          <div class="form-group">
            <label class="form-label" for="login-email">Email</label>
            <div class="form-input-icon">
              <span class="material-symbols-outlined">mail</span>
              <input class="form-input" id="login-email" type="email" placeholder="you@example.com" required style="background:rgba(10,25,15,0.6)">
            </div>
          </div>

          <div class="form-group">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <label class="form-label" for="login-password">Password</label>
              <a href="#/forgot-password" style="font-size:0.7rem;font-weight:var(--fw-bold);color:var(--color-primary)">Forgot?</a>
            </div>
            <div style="position:relative">
              <div class="form-input-icon">
                <span class="material-symbols-outlined">lock</span>
                <input class="form-input" id="login-password" type="password" placeholder="••••••••" required style="background:rgba(10,25,15,0.6)">
              </div>
              <button type="button" style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);color:var(--color-slate-400);background:none;border:none;cursor:pointer" onclick="const i=document.getElementById('login-password');i.type=i.type==='password'?'text':'password'">
                <span class="material-symbols-outlined" style="font-size:1.125rem">visibility</span>
              </button>
            </div>
          </div>

          <button id="login-btn" type="submit" class="btn btn-primary" style="width:100%;padding:var(--space-3) var(--space-4)">
            <span class="material-symbols-outlined" style="font-size:1.125rem">login</span>
            <span id="login-btn-text">Sign In</span>
          </button>
        </form>

        <div style="margin-top:var(--space-6);padding-top:var(--space-5);border-top:1px solid rgba(74,222,128,0.1);text-align:center">
          <p style="font-size:0.8125rem;color:var(--color-slate-500)">New to TerraShield? <a href="#/signup" style="font-weight:var(--fw-bold);color:var(--color-primary)">Create account</a></p>
        </div>
      </div>

      <!-- Footer -->
      <div class="hero-animate-delay-2" style="margin-top:var(--space-8);text-align:center">
        <p style="font-size:0.65rem;color:var(--color-slate-500);text-transform:uppercase;letter-spacing:0.1em">&copy; 2026 TerraShield · Privacy · Terms</p>
      </div>
    </div>

    <style>
      @keyframes firefly-float {
        0%, 100% { transform: translate(0,0); opacity: 0.2; }
        25% { transform: translate(15px,-20px); opacity: 0.6; }
        50% { transform: translate(-10px,-30px); opacity: 0.3; }
        75% { transform: translate(20px,-10px); opacity: 0.5; }
      }
      @keyframes login-shimmer {
        0% { transform: translateX(-100%); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
      }
    </style>
  </div>`,

    async init() {
      // Redirect if already signed in
      const user = await getUser();
      if (user) { window.location.hash = '#/'; return; }

      // ═══ Interactive effects ═══
      const cleanups = [];

      // 1. 3D tilt on the card
      const c2 = initCardTilt('#login-card', { maxTilt: 5, glare: true });
      if (c2) cleanups.push(c2);

      // 3. Cursor-reactive floating orbs (replace static particles)
      const c3 = initReactiveOrbs('#login-orbs', { count: 10 });
      if (c3) cleanups.push(c3);

      // 4. Cursor spotlight glow
      const c4 = initCursorSpotlight('#login-page');
      if (c4) cleanups.push(c4);

      // Form submit
      document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');
        const btnText = document.getElementById('login-btn-text');
        const msg = document.getElementById('login-msg');

        btn.disabled = true;
        btnText.textContent = 'Signing in…';
        msg.style.display = 'none';

        const { error } = await signIn(email, password);

        if (error) {
          msg.style.display = 'block';
          msg.style.background = 'var(--color-red-50)';
          msg.style.color = 'var(--color-red)';
          msg.style.border = '1px solid rgba(239,68,68,0.2)';
          msg.textContent = error.message;
          btn.disabled = false;
          btnText.textContent = 'Sign In';
        } else {
          msg.style.display = 'block';
          msg.style.background = 'var(--color-emerald-50)';
          msg.style.color = 'var(--color-emerald)';
          msg.style.border = '1px solid rgba(16,185,129,0.2)';
          msg.textContent = '✓ Signed in! Redirecting…';
          setTimeout(() => { window.location.hash = '#/'; }, 700);
        }
      });

      initNavbarAuth();
    }
  };
}
