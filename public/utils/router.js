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

        // Magnet effect on all card-type elements and CTA buttons
        if (magnetCleanup) { magnetCleanup(); magnetCleanup = null; }
        const cleanups = [];
        const c1 = initMagnetAll('.card.hover-lift', { padding: 80, strength: 3 });
        const c2 = initMagnetAll('.stat-card, [class*="stat-"]', { padding: 60, strength: 4 });
        const c3 = initMagnetAll('#login-card, #signup-card, .hero-animate-delay[style*="border-radius"]', { padding: 50, strength: 5 });
        const c4 = initMagnetAll('.btn-primary', { padding: 50, strength: 4 });
        const c5 = initMagnetAll('.btn-lg:not(.btn-primary)', { padding: 40, strength: 5 });
        const c6 = initMagnetAll('[data-delay].card', { padding: 70, strength: 3.5 });
        [c1, c2, c3, c4, c5, c6].forEach(c => { if (c) cleanups.push(c); });
        magnetCleanup = () => cleanups.forEach(fn => fn());
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
