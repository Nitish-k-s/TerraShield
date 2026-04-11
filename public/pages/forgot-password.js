// Forgot Password Page – Paper-Cut Landscape Theme
export function renderForgotPassword() {
  return {
    html: `
  <div style="min-height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden;background:linear-gradient(180deg,#e0f2f1 0%,#e8f5f3 30%,#f0f8f6 60%,#fdfbf7 100%)">

    <!-- Mountains & scenery -->
    <div style="position:absolute;inset:0;pointer-events:none;z-index:0">
      <!-- Sun -->
      <div style="position:absolute;top:3rem;left:50%;transform:translateX(-50%);z-index:1">
        <svg width="80" height="80" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="35" fill="#ffecb3" opacity="0.7"/>
          <circle cx="70" cy="70" r="48" fill="none" stroke="rgba(255,236,179,0.2)" stroke-width="1" style="animation:pulse-ring 4s ease-in-out infinite"/>
        </svg>
      </div>

      <!-- Clouds -->
      <svg style="position:absolute;top:12%;left:-5%;opacity:0.4;animation:drift-right 52s linear infinite" width="130" height="45" viewBox="0 0 160 60">
        <ellipse cx="80" cy="35" rx="60" ry="16" fill="#fff" opacity="0.8"/>
        <ellipse cx="50" cy="30" rx="30" ry="12" fill="#fff" opacity="0.5"/>
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

      <!-- Particles -->
      <div id="forgot-particles" style="position:absolute;inset:0;pointer-events:none;z-index:4"></div>
    </div>

    <!-- Content -->
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;z-index:10;padding:var(--space-8) var(--space-4)">

      <!-- Logo -->
      <a href="#/" class="hero-animate" style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-8);text-decoration:none">
        <img src="/terrashield-logo.svg" width="48" height="48" alt="TerraShield" style="object-fit:contain"/>
        <span style="font-size:1.375rem;font-weight:var(--fw-bold);color:var(--color-slate-800);letter-spacing:-0.02em">TerraShield</span>
      </a>

      <!-- Card -->
      <div class="hero-animate-delay" style="width:100%;max-width:24rem;background:rgba(255,255,255,0.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:var(--radius-xl);box-shadow:0 8px 32px rgba(0,0,0,0.08);border:1px solid rgba(255,255,255,0.6);padding:var(--space-10)">

        <!-- Icon -->
        <div style="text-align:center;margin-bottom:var(--space-6)">
          <div style="width:3.5rem;height:3.5rem;border-radius:50%;background:rgba(29,172,201,0.1);display:inline-flex;align-items:center;justify-content:center;margin-bottom:var(--space-3)">
            <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:1.5rem">lock_reset</span>
          </div>
          <h2 class="font-serif" style="font-size:1.5rem;font-weight:var(--fw-bold);color:var(--color-slate-800)">Reset Password</h2>
          <p style="color:var(--color-slate-500);margin-top:var(--space-2);font-size:0.8125rem;line-height:1.6">Enter your email and we'll send you a secure reset link.</p>
        </div>

        <form id="forgot-form" style="display:flex;flex-direction:column;gap:var(--space-5)">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <div class="form-input-icon">
              <span class="material-symbols-outlined">mail</span>
              <input class="form-input" id="forgot-email" type="email" placeholder="you@example.com" required style="background:rgba(255,255,255,0.6)">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">New Password</label>
            <div class="form-input-icon">
              <span class="material-symbols-outlined">lock</span>
              <input class="form-input" id="forgot-newpass" type="password" placeholder="••••••••" required minlength="6" style="background:rgba(255,255,255,0.6)">
            </div>
          </div>
          <div id="forgot-msg" style="display:none;padding:var(--space-3);border-radius:var(--radius);font-size:0.8125rem;text-align:center"></div>
          <button type="submit" id="forgot-btn" class="btn btn-primary" style="width:100%;padding:var(--space-3) var(--space-4)">
            <span class="material-symbols-outlined" style="font-size:1.125rem">lock_reset</span> <span id="forgot-btn-text">Reset Password</span>
          </button>
        </form>

        <div style="margin-top:var(--space-6);text-align:center">
          <a href="#/login" style="display:inline-flex;align-items:center;gap:var(--space-2);font-size:0.8125rem;color:var(--color-slate-500);font-weight:var(--fw-medium)">
            <span class="material-symbols-outlined" style="font-size:0.875rem">arrow_back</span> Back to Sign In
          </a>
        </div>
      </div>

      <!-- Help -->
      <div class="hero-animate-delay-2" style="margin-top:var(--space-6)">
        <a href="#" style="display:inline-flex;align-items:center;gap:var(--space-2);font-size:0.75rem;color:var(--color-slate-400);padding:var(--space-2) var(--space-5);border:1px solid var(--color-slate-200);border-radius:var(--radius-full);background:rgba(255,255,255,0.5)">
          <span class="material-symbols-outlined" style="font-size:0.875rem">help</span> Need more help?
        </a>
      </div>

      <!-- Footer -->
      <div class="hero-animate-delay-2" style="margin-top:var(--space-6);text-align:center">
        <p style="font-size:0.65rem;color:var(--color-slate-400);text-transform:uppercase;letter-spacing:0.1em">&copy; 2026 TerraShield · Privacy · Terms</p>
      </div>
    </div>
  </div>`,
    async init() {
      const c = document.getElementById('forgot-particles');
      if (c) {
        const symbols = ['🍃', '🌿', '•', '✦'];
        for (let i = 0; i < 8; i++) {
          const p = document.createElement('span');
          p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
          p.style.cssText = 'position:absolute;font-size:' + (7 + Math.random() * 7) + 'px;opacity:0.12;animation:particle-float ' + (6 + Math.random() * 6) + 's ease-in-out ' + (Math.random() * 4) + 's infinite;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 60) + '%;pointer-events:none';
          c.appendChild(p);
        }
      }

      const form = document.getElementById('forgot-form');
      if (!form) return;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value.trim();
        const newPassword = document.getElementById('forgot-newpass').value;
        const btn = document.getElementById('forgot-btn');
        const btnText = document.getElementById('forgot-btn-text');
        const msg = document.getElementById('forgot-msg');

        btn.disabled = true;
        btnText.textContent = 'Resetting...';

        try {
          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword }),
          });
          const data = await res.json();
          msg.style.display = 'block';
          if (res.ok) {
            msg.style.background = 'rgba(16,185,129,0.1)';
            msg.style.color = '#10b981';
            msg.style.border = '1px solid rgba(16,185,129,0.2)';
            msg.textContent = '✓ Password reset! Redirecting to sign in...';
            setTimeout(() => { window.location.hash = '#/login'; }, 1500);
          } else {
            msg.style.background = 'rgba(239,68,68,0.1)';
            msg.style.color = '#ef4444';
            msg.style.border = '1px solid rgba(239,68,68,0.2)';
            msg.textContent = data.error || 'Reset failed.';
            btn.disabled = false;
            btnText.textContent = 'Reset Password';
          }
        } catch {
          msg.style.display = 'block';
          msg.style.color = '#ef4444';
          msg.textContent = 'Network error. Try again.';
          btn.disabled = false;
          btnText.textContent = 'Reset Password';
        }
      });
    }
  };
}
