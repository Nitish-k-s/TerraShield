/**
 * Magnet – Vanilla JS port of the React Magnet component.
 * Elements subtly follow the cursor when it's nearby, creating a magnetic pull effect.
 *
 * Usage:
 *   const cleanup = initMagnet(element, { padding: 100, strength: 2 });
 *   const cleanup = initMagnetAll('.card', { padding: 80, strength: 3 });
 */

function applyMagnet(el, options = {}) {
    const {
        padding = 100,
        strength = 2,
        activeTransition = 'transform 0.3s ease-out',
        inactiveTransition = 'transform 0.5s ease-in-out',
        recalculateOnResize = true
    } = options;

    el.style.willChange = 'transform';
    el.style.transition = inactiveTransition;

    let active = false;
    let ticking = false;

    // Cache the bounding box so we don't recalculate it on every single mousemove
    let rect = { left: 0, top: 0, width: 0, height: 0 };
    let cx = 0, cy = 0;

    const calcRect = () => {
        rect = el.getBoundingClientRect();
        cx = rect.left + rect.width / 2;
        cy = rect.top + rect.height / 2;
    };

    // Initialize dimensions
    // Use a slight timeout to ensure CSS is applied
    setTimeout(calcRect, 50);

    let resizeObserver;
    if (recalculateOnResize) {
        resizeObserver = new ResizeObserver(calcRect);
        resizeObserver.observe(el);
    }

    const updateTransform = (clientX, clientY) => {
        const dx = Math.abs(cx - clientX);
        const dy = Math.abs(cy - clientY);

        if (dx < rect.width / 2 + padding && dy < rect.height / 2 + padding) {
            if (!active) {
                active = true;
                el.style.transition = activeTransition;
            }
            const ox = (clientX - cx) / strength;
            const oy = (clientY - cy) / strength;
            el.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
        } else if (active) {
            active = false;
            el.style.transition = inactiveTransition;
            el.style.transform = 'translate3d(0, 0, 0)';
        }
        ticking = false;
    };

    const onMove = e => {
        if (!ticking) {
            // Debounce using requestAnimationFrame to fix the severe lag!
            window.requestAnimationFrame(() => updateTransform(e.clientX, e.clientY));
            ticking = true;
        }
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    // Handle scroll since the element moves relative to the viewport
    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(calcRect);
            ticking = true;
            // ticking resets inside calcRect are not needed as it's just updating cached values
            // but we need to reset ticking after the frame
            window.requestAnimationFrame(() => { ticking = false; });
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return function cleanup() {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('scroll', onScroll);
        if (resizeObserver) resizeObserver.disconnect();
        el.style.transform = '';
        el.style.willChange = '';
        el.style.transition = '';
    };
}

/**
 * Apply magnet effect to a single element
 */
export function initMagnet(selector, options = {}) {
    const el = typeof selector === 'string'
        ? document.querySelector(selector)
        : selector;
    if (!el) return null;
    return applyMagnet(el, options);
}

/**
 * Apply magnet effect to all matching elements
 * Returns a single cleanup function that removes all listeners
 */
export function initMagnetAll(selector, options = {}) {
    const els = typeof selector === 'string'
        ? document.querySelectorAll(selector)
        : selector;
    if (!els || els.length === 0) return null;

    const cleanups = [];
    els.forEach(el => {
        const c = applyMagnet(el, options);
        if (c) cleanups.push(c);
    });

    return function cleanupAll() {
        cleanups.forEach(fn => fn());
    };
}
