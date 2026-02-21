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
        inactiveTransition = 'transform 0.5s ease-in-out'
    } = options;

    // Apply directly on the element — no DOM wrapping
    el.style.willChange = 'transform';
    el.style.transition = inactiveTransition;

    let active = false;

    const onMove = e => {
        const { left, top, width, height } = el.getBoundingClientRect();
        const cx = left + width / 2;
        const cy = top + height / 2;
        const dx = Math.abs(cx - e.clientX);
        const dy = Math.abs(cy - e.clientY);

        if (dx < width / 2 + padding && dy < height / 2 + padding) {
            if (!active) {
                active = true;
                el.style.transition = activeTransition;
            }
            const ox = (e.clientX - cx) / strength;
            const oy = (e.clientY - cy) / strength;
            el.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
        } else if (active) {
            active = false;
            el.style.transition = inactiveTransition;
            el.style.transform = 'translate3d(0, 0, 0)';
        }
    };

    window.addEventListener('mousemove', onMove);

    return function cleanup() {
        window.removeEventListener('mousemove', onMove);
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
