/**
 * Auth Page Interactive Effects
 * Playful cursor-driven interactions for login/signup pages:
 * 1. 3D tilt on the glassmorphism card
 * 2. Cursor-reactive floating orbs that drift away from the mouse
 * 3. Shield mascot eyes that follow the cursor
 * 4. Glow spotlight that follows the cursor on the card
 */

/**
 * 3D Tilt effect on a card element.
 * Card rotates slightly based on cursor position over it.
 */
export function initCardTilt(selector, { maxTilt = 6, glare = true } = {}) {
    const card = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!card) return null;

    card.style.transformStyle = 'preserve-3d';
    card.style.transition = 'transform 0.15s ease-out';

    // Optional glare overlay
    let glareEl = null;
    if (glare) {
        glareEl = document.createElement('div');
        glareEl.style.cssText = `
      position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:50;
      background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 60%);
      opacity:0;transition:opacity 0.3s ease;
    `;
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.appendChild(glareEl);
    }

    const onMove = e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rotY = (x - 0.5) * maxTilt * 2;
        const rotX = (0.5 - y) * maxTilt * 2;
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
        if (glareEl) {
            glareEl.style.opacity = '1';
            glareEl.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.2) 0%, transparent 60%)`;
        }
    };
    const onLeave = () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        if (glareEl) glareEl.style.opacity = '0';
    };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);

    return () => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
        if (glareEl) glareEl.remove();
    };
}

/**
 * Cursor-reactive floating orbs.
 * Pretty glowing orbs that drift around and gently push away from the cursor.
 */
export function initReactiveOrbs(containerSelector, { count = 8 } = {}) {
    const container = typeof containerSelector === 'string'
        ? document.querySelector(containerSelector)
        : containerSelector;
    if (!container) return null;

    const orbs = [];
    const mouse = { x: -9999, y: -9999 };
    const colors = [
        'rgba(29,172,201,0.15)',
        'rgba(45,90,76,0.12)',
        'rgba(255,236,179,0.2)',
        'rgba(29,172,201,0.1)',
        'rgba(200,213,195,0.18)',
        'rgba(16,185,129,0.12)',
    ];

    for (let i = 0; i < count; i++) {
        const orb = document.createElement('div');
        const size = 10 + Math.random() * 30;
        const data = {
            x: Math.random() * 100,
            y: Math.random() * 80,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size,
            el: orb
        };
        orb.style.cssText = `
      position:absolute;
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${colors[i % colors.length]};
      backdrop-filter:blur(2px);
      pointer-events:none;
      left:${data.x}%;top:${data.y}%;
      transition:none;
      z-index:1;
    `;
        container.appendChild(orb);
        orbs.push(data);
    }

    const onMove = e => {
        const r = container.getBoundingClientRect();
        mouse.x = ((e.clientX - r.left) / r.width) * 100;
        mouse.y = ((e.clientY - r.top) / r.height) * 100;
    };
    container.addEventListener('mousemove', onMove);

    let rafId;
    function tick() {
        orbs.forEach(o => {
            // Flee from cursor
            const dx = o.x - mouse.x;
            const dy = o.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 20) {
                const angle = Math.atan2(dy, dx);
                const force = (20 - dist) * 0.08;
                o.vx += Math.cos(angle) * force;
                o.vy += Math.sin(angle) * force;
            }

            // Gentle drift
            o.x += o.vx;
            o.y += o.vy;

            // Damping
            o.vx *= 0.97;
            o.vy *= 0.97;

            // Bounce off edges
            if (o.x < 0) { o.x = 0; o.vx *= -0.5; }
            if (o.x > 100) { o.x = 100; o.vx *= -0.5; }
            if (o.y < 0) { o.y = 0; o.vy *= -0.5; }
            if (o.y > 100) { o.y = 100; o.vy *= -0.5; }

            o.el.style.left = o.x + '%';
            o.el.style.top = o.y + '%';
        });
        rafId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
        cancelAnimationFrame(rafId);
        container.removeEventListener('mousemove', onMove);
        orbs.forEach(o => o.el.remove());
    };
}

/**
 * Shield mascot with eyes that follow the cursor.
 * Renders an SVG shield with two animated eyes inside.
 */
export function createShieldMascot() {
    return `
    <div id="shield-mascot" style="position:relative;width:80px;height:80px;margin:0 auto var(--space-4);cursor:default">
      <svg viewBox="0 0 100 110" width="80" height="88" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mascot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1dacc9"/>
            <stop offset="100%" stop-color="#2d5a4c"/>
          </linearGradient>
        </defs>
        <!-- Shield body -->
        <path d="M50 5 L90 25 L90 55 C90 78 74 95 50 102 C26 95 10 78 10 55 L10 25 Z" fill="url(#mascot-grad)" opacity="0.92"/>
        <!-- Highlight -->
        <path d="M50 5 L90 25 L90 55 C90 78 74 95 50 102" fill="rgba(255,255,255,0.07)"/>

        <!-- Left eye white -->
        <ellipse cx="36" cy="48" rx="10" ry="11" fill="#fff"/>
        <!-- Right eye white -->
        <ellipse cx="64" cy="48" rx="10" ry="11" fill="#fff"/>

        <!-- Left pupil (animated via JS) -->
        <circle id="mascot-eye-l" cx="36" cy="48" r="5" fill="#1e293b"/>
        <!-- Right pupil -->
        <circle id="mascot-eye-r" cx="64" cy="48" r="5" fill="#1e293b"/>

        <!-- Left eye shine -->
        <circle cx="33" cy="45" r="2" fill="#fff" opacity="0.8"/>
        <!-- Right eye shine -->
        <circle cx="61" cy="45" r="2" fill="#fff" opacity="0.8"/>

        <!-- Smile -->
        <path d="M40 68 Q50 78 60 68" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
      </svg>
    </div>`;
}

/**
 * Animate the shield mascot eyes to follow the cursor.
 */
export function initMascotEyes(containerId = 'shield-mascot') {
    const mascot = document.getElementById(containerId);
    if (!mascot) return null;

    const eyeL = document.getElementById('mascot-eye-l');
    const eyeR = document.getElementById('mascot-eye-r');
    if (!eyeL || !eyeR) return null;

    const BASE_L = { cx: 36, cy: 48 };
    const BASE_R = { cx: 64, cy: 48 };
    const MAX_MOVE = 4;

    const onMove = e => {
        const r = mascot.getBoundingClientRect();
        const mx = r.left + r.width / 2;
        const my = r.top + r.height / 2;
        const dx = e.clientX - mx;
        const dy = e.clientY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clamp = Math.min(dist, 200) / 200;
        const angle = Math.atan2(dy, dx);

        const ox = Math.cos(angle) * MAX_MOVE * clamp;
        const oy = Math.sin(angle) * MAX_MOVE * clamp;

        eyeL.setAttribute('cx', BASE_L.cx + ox);
        eyeL.setAttribute('cy', BASE_L.cy + oy);
        eyeR.setAttribute('cx', BASE_R.cx + ox);
        eyeR.setAttribute('cy', BASE_R.cy + oy);
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
}

/**
 * Cursor spotlight glow that follows the mouse across the page background.
 */
export function initCursorSpotlight(containerSelector) {
    const container = typeof containerSelector === 'string'
        ? document.querySelector(containerSelector)
        : containerSelector;
    if (!container) return null;

    const spot = document.createElement('div');
    spot.style.cssText = `
    position:fixed;width:300px;height:300px;border-radius:50%;
    background:radial-gradient(circle, rgba(29,172,201,0.06) 0%, transparent 70%);
    pointer-events:none;z-index:0;transform:translate(-50%,-50%);
    transition:left 0.1s ease-out, top 0.1s ease-out;
  `;
    container.appendChild(spot);

    const onMove = e => {
        spot.style.left = e.clientX + 'px';
        spot.style.top = e.clientY + 'px';
    };
    window.addEventListener('mousemove', onMove);

    return () => {
        window.removeEventListener('mousemove', onMove);
        spot.remove();
    };
}
