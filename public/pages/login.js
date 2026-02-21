// Login Page – Paper-Cut Landscape Theme + Real Supabase Auth
import { renderNavbar, initNavbarAuth } from '../components/navbar.js';
import { signIn, getUser } from '../utils/auth.js';

export function renderLogin() {
  return {
    html: `
  ${renderNavbar('login')}
  <div style="min-height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden;background:linear-gradient(180deg,#e0f2f1 0%,#e8f5f3 30%,#f0f8f6 60%,#fdfbf7 100%)">

    <!-- Mountains & scenery -->
    <div style="position:absolute;inset:0;pointer-events:none;z-index:0">
      <!-- Sun -->
      <div style="position:absolute;top:2.5rem;right:15%;z-index:1">
        <svg width="100" height="100" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="40" fill="#ffecb3" opacity="0.8"/>
          <circle cx="70" cy="70" r="52" fill="none" stroke="rgba(255,236,179,0.25)" stroke-width="1" style="animation:pulse-ring 4s ease-in-out infinite"/>
        </svg>
      </div>

      <!-- Clouds -->
      <svg style="position:absolute;top:10%;left:-5%;opacity:0.5;animation:drift-right 50s linear infinite" width="140" height="50" viewBox="0 0 160 60">
        <ellipse cx="80" cy="35" rx="65" ry="18" fill="#fff" opacity="0.8"/>
        <ellipse cx="55" cy="30" rx="35" ry="14" fill="#fff" opacity="0.6"/>
      </svg>
      <svg style="position:absolute;top:5%;right:0;opacity:0.35;animation:drift-left 60s linear 3s infinite" width="100" height="40" viewBox="0 0 120 50">
        <ellipse cx="60" cy="28" rx="50" ry="16" fill="#fff" opacity="0.7"/>
      </svg>

      <!-- Mountain layers -->
      <svg style="position:absolute;bottom:0;width:100%;z-index:1" preserveAspectRatio="none" viewBox="0 0 1440 320" height="55%">
        <path d="M0,192L80,181.3C160,171,320,149,480,165.3C640,181,800,235,960,245.3C1120,256,1280,224,1360,208L1440,192L1440,320L0,320Z" fill="#c8d5c3" opacity="0.5"/>
      </svg>
      <svg style="position:absolute;bottom:0;width:100%;z-index:2" preserveAspectRatio="none" viewBox="0 0 1440 320" height="42%">
        <path d="M0,224L60,213.3C120,203,240,181,360,192C480,203,600,245,720,250.7C840,256,960,224,1080,202.7C1200,181,1320,171,1380,165.3L1440,160L1440,320L0,320Z" fill="rgba(194,163,142,0.35)"/>
      </svg>
      <svg style="position:absolute;bottom:0;width:100%;z-index:3" preserveAspectRatio="none" viewBox="0 0 1440 320" height="28%">
        <path d="M0,256L48,250.7C96,245,192,235,288,229.3C384,224,480,224,576,234.7C672,245,768,267,864,261.3C960,256,1056,224,1152,218.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L0,320Z" fill="#4a5d4e" opacity="0.7"/>
      </svg>

      <!-- Floating particles -->
      <div id="auth-particles" style="position:absolute;inset:0;pointer-events:none;z-index:4"></div>
    </div>

    <!-- Content -->
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;z-index:10;padding:var(--space-8) var(--space-4)">

      <!-- Logo -->
      <a href="#/" class="hero-animate" style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-8);text-decoration:none">
        <svg class="ts-logo" width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="shield-grad-login" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1dacc9"/><stop offset="100%" stop-color="#2d5a4c"/></linearGradient></defs>
          <path d="M50 8 L88 28 L88 52 C88 74 72 90 50 96 C28 90 12 74 12 52 L12 28 Z" fill="url(#shield-grad-login)" opacity="0.9">
            <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite"/>
          </path>
          <path d="M50 30 C50 30 36 44 36 56 C36 64 42 70 50 70 C58 70 64 64 64 56 C64 44 50 30 50 30Z" fill="#fff" opacity="0.9"/>
        </svg>
        <span style="font-size:1.375rem;font-weight:var(--fw-bold);color:var(--color-slate-800);letter-spacing:-0.02em">TerraShield</span>
      </a>

      <!-- Card -->
      <div class="hero-animate-delay" style="width:100%;max-width:24rem;background:rgba(255,255,255,0.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:var(--radius-xl);box-shadow:0 8px 32px rgba(0,0,0,0.08);border:1px solid rgba(255,255,255,0.6);padding:var(--space-10)">
        <div style="text-align:center;margin-bottom:var(--space-8)">
          <h2 class="font-serif" style="font-size:1.5rem;font-weight:var(--fw-bold);color:var(--color-slate-800)">Welcome Back</h2>
          <p style="color:var(--color-slate-500);margin-top:var(--space-2);font-size:0.8125rem">Sign in to the TerraShield detection network.</p>
        </div>

        <!-- Error / success banner -->
        <div id="login-msg" style="display:none;margin-bottom:var(--space-5);padding:var(--space-3) var(--space-4);border-radius:var(--radius);font-size:0.8125rem;text-align:center"></div>

        <form id="login-form" style="display:flex;flex-direction:column;gap:var(--space-5)">
          <div class="form-group">
            <label class="form-label" for="login-email">Email</label>
            <div class="form-input-icon">
              <span class="material-symbols-outlined">mail</span>
              <input class="form-input" id="login-email" type="email" placeholder="you@example.com" required style="background:rgba(255,255,255,0.6)">
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
                <input class="form-input" id="login-password" type="password" placeholder="••••••••" required style="background:rgba(255,255,255,0.6)">
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

        <div style="margin-top:var(--space-6);padding-top:var(--space-5);border-top:1px solid rgba(0,0,0,0.06);text-align:center">
          <p style="font-size:0.8125rem;color:var(--color-slate-500)">New to TerraShield? <a href="#/signup" style="font-weight:var(--fw-bold);color:var(--color-primary)">Create account</a></p>
        </div>
      </div>

      <!-- Footer -->
      <div class="hero-animate-delay-2" style="margin-top:var(--space-8);text-align:center">
        <p style="font-size:0.65rem;color:var(--color-slate-400);text-transform:uppercase;letter-spacing:0.1em">&copy; 2025 TerraShield · Privacy · Terms</p>
      </div>
    </div>
  </div>`,

    async init() {
      // Redirect if already signed in
      const user = await getUser();
      if (user) { window.location.hash = '#/'; return; }

      // Particles
      const c = document.getElementById('auth-particles');
      if (c) {
        const symbols = ['🍃', '🌿', '•', '✦'];
        for (let i = 0; i < 10; i++) {
          const p = document.createElement('span');
          p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
          p.style.cssText = 'position:absolute;font-size:' + (7 + Math.random() * 7) + 'px;opacity:0.12;animation:particle-float ' + (6 + Math.random() * 6) + 's ease-in-out ' + (Math.random() * 4) + 's infinite;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 60) + '%;pointer-events:none';
          c.appendChild(p);
        }
      }

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
