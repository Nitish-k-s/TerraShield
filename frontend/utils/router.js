// SPA Hash Router
import { initScrollObserver, animateCounters } from './scroll-observer.js';
import { initLazyLoad } from './lazy-load.js';

// Page imports
import { renderHome } from '../pages/home.js';
import { renderAbout } from '../pages/about.js';
import { renderAlerts } from '../pages/sdgs.js';
import { renderReport } from '../pages/take-action.js';
import { renderLogin } from '../pages/login.js';
import { renderSignup } from '../pages/signup.js';
import { renderForgotPassword } from '../pages/forgot-password.js';

const routes = {
    '/': renderHome,
    '/about': renderAbout,
    '/alerts': renderAlerts,
    '/report': renderReport,
    '/login': renderLogin,
    '/signup': renderSignup,
    '/forgot-password': renderForgotPassword,
};

const app = document.getElementById('app');

function getRoute() {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
}

let currentCleanup = null;

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

    // Initialize observers
    setTimeout(() => {
        initScrollObserver();
        animateCounters();
        initLazyLoad();
        initParallax();
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
