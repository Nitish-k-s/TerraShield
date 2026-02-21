// SPA Hash Router
import { initScrollObserver, animateCounters } from './scroll-observer.js';
import { initLazyLoad } from './lazy-load.js';
import { initNavbarAuth } from '../components/navbar.js';
import { initMagnetAll } from './magnet.js';

// Page imports
import { renderHome } from '../pages/home.js';
import { renderAbout } from '../pages/about.js';
import { renderAlerts } from '../pages/sdgs.js';
import { renderReport } from '../pages/take-action.js';
import { renderLogin } from '../pages/login.js';
import { renderSignup } from '../pages/signup.js';
import { renderForgotPassword } from '../pages/forgot-password.js';
import { renderProfile } from '../pages/profile.js';

const routes = {
    '/': renderHome,
    '/about': renderAbout,
    '/alerts': renderAlerts,
    '/report': renderReport,
    '/login': renderLogin,
    '/signup': renderSignup,
    '/forgot-password': renderForgotPassword,
    '/profile': renderProfile,
};

const app = document.getElementById('app');

function getRoute() {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
}

let currentCleanup = null;
let magnetCleanup = null;

async function navigate() {
    const path = getRoute();
    const render = routes[path] || routes['/'];

    // Cleanup previous page
    if (currentCleanup && typeof currentCleanup === 'function') {
        currentCleanup();
        currentCleanup = null;
    }

    // Page exit
    app.classList.remove('page-active');
    app.classList.add('page-enter');

    await new Promise(r => setTimeout(r, 100));

    // Render new page
    const result = render();
    if (typeof result === 'object' && result.html) {
        app.innerHTML = result.html;
        currentCleanup = result.cleanup || null;
        if (result.init) result.init();
    } else {
        app.innerHTML = result;
    }

    // Page enter
    requestAnimationFrame(() => {
        app.classList.remove('page-enter');
        app.classList.add('page-active');
    });

    // Initialize observers + navbar auth
    setTimeout(() => {
        initScrollObserver();
        animateCounters();
        initLazyLoad();
        initParallax();
        initNavbarAuth();

        // Global magnet effect on cards and primary buttons
        if (magnetCleanup) { magnetCleanup(); magnetCleanup = null; }
        const cleanups = [];
        const c1 = initMagnetAll('.card.hover-lift', { padding: 80, strength: 3 });
        const c2 = initMagnetAll('.btn-primary', { padding: 50, strength: 4 });
        const c3 = initMagnetAll('.btn-lg', { padding: 50, strength: 4 });
        if (c1) cleanups.push(c1);
        if (c2) cleanups.push(c2);
        if (c3) cleanups.push(c3);
        magnetCleanup = () => cleanups.forEach(fn => fn());

        // Footer effects
        initFooterEffects();

        // Hero particles for inner pages (alerts, report, about)
        ['alerts-hero-particles', 'report-hero-particles', 'about-hero-particles'].forEach(id => {
            const pc = document.getElementById(id);
            if (pc && !pc.hasChildNodes()) {
                const symbols = ['🍃', '🌿', '✦', '🌱', '•'];
                for (let i = 0; i < 10; i++) {
                    const s = document.createElement('span');
                    s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                    const sz = 8 + Math.random() * 10;
                    s.style.cssText = `position:absolute;font-size:${sz}px;opacity:${0.08 + Math.random() * 0.1};left:${Math.random() * 100}%;top:${Math.random() * 80}%;pointer-events:none;animation:particle-float ${6 + Math.random() * 8}s ease-in-out ${Math.random() * 4}s infinite`;
                    pc.appendChild(s);
                }
            }
        });
    }, 50);

    // Scroll to top
    window.scrollTo(0, 0);
}

// Simple parallax for hero layers
function initParallax() {
    const layers = document.querySelectorAll('.parallax-layer');
    if (!layers.length) return;

    let ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                layers.forEach(layer => {
                    const speed = parseFloat(layer.dataset.speed) || 0.3;
                    layer.style.transform = `translateY(${scrollY * speed}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
}

// Footer animated effects – particles + stat counters
function initFooterEffects() {
    // Spawn floating particles
    const pc = document.getElementById('footer-particles');
    if (pc && !pc.hasChildNodes()) {
        const symbols = ['🍃', '🌿', '✦', '•', '🌱'];
        for (let i = 0; i < 14; i++) {
            const s = document.createElement('span');
            s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            const size = 6 + Math.random() * 8;
            s.style.cssText = `position:absolute;font-size:${size}px;opacity:${0.06 + Math.random() * 0.08};left:${Math.random() * 100}%;top:${Math.random() * 80}%;pointer-events:none;animation:particle-float ${8 + Math.random() * 8}s ease-in-out ${Math.random() * 5}s infinite`;
            pc.appendChild(s);
        }
    }

    // Animated counters: count up when the footer scrolls into view
    const statEls = document.querySelectorAll('.footer-stat-number[data-target]');
    if (!statEls.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el.dataset.counted) return;
            el.dataset.counted = 'true';

            const target = parseInt(el.dataset.target, 10);
            const duration = 1800;
            const start = performance.now();

            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(target * eased).toLocaleString();
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            observer.unobserve(el);
        });
    }, { threshold: 0.3 });

    statEls.forEach(el => observer.observe(el));
}

// Nav scroll effect
function initNavScroll() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });
}

// Initialize
window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', () => {
    navigate();
    initNavScroll();
});
