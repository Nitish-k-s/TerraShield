/**
 * GradualBlur – Vanilla JS port of the React GradualBlur component.
 * Creates a gradual backdrop-filter blur fade effect using layered divs
 * with CSS mask-image gradients.
 *
 * Usage:
 *   const cleanup = initGradualBlur('#my-container', {
 *     position: 'bottom',
 *     strength: 2,
 *     height: '6rem',
 *     divCount: 5,
 *     curve: 'ease-out'
 *   });
 */

const CURVE_FUNCTIONS = {
    linear: p => p,
    bezier: p => p * p * (3 - 2 * p),
    'ease-in': p => p * p,
    'ease-out': p => 1 - Math.pow(1 - p, 2),
    'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
};

const DIRECTION_MAP = {
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right'
};

const DEFAULTS = {
    position: 'bottom',
    strength: 2,
    height: '6rem',
    divCount: 5,
    exponential: false,
    zIndex: 10,
    opacity: 1,
    curve: 'ease-out',
    target: 'parent'    // 'parent' = absolute inside parent, 'page' = fixed
};

export function initGradualBlur(selector, options = {}) {
    const parent = typeof selector === 'string'
        ? document.querySelector(selector)
        : selector;
    if (!parent) return null;

    const config = { ...DEFAULTS, ...options };

    // Ensure parent has position context
    const parentPos = getComputedStyle(parent).position;
    if (parentPos === 'static') {
        parent.style.position = 'relative';
    }

    // Build container
    const container = document.createElement('div');
    container.className = 'gradual-blur';

    const isVertical = ['top', 'bottom'].includes(config.position);
    const isPage = config.target === 'page';

    Object.assign(container.style, {
        position: isPage ? 'fixed' : 'absolute',
        pointerEvents: 'none',
        zIndex: config.zIndex,
        ...(isVertical ? {
            height: config.height,
            width: '100%',
            left: '0',
            right: '0',
            [config.position]: '0'
        } : {
            width: config.height,
            height: '100%',
            top: '0',
            bottom: '0',
            [config.position]: '0'
        })
    });

    // Inner wrapper
    const inner = document.createElement('div');
    inner.style.cssText = 'position:relative;width:100%;height:100%;pointer-events:none;';

    // Build blur divs
    const increment = 100 / config.divCount;
    const curveFunc = CURVE_FUNCTIONS[config.curve] || CURVE_FUNCTIONS.linear;
    const direction = DIRECTION_MAP[config.position] || 'to bottom';

    for (let i = 1; i <= config.divCount; i++) {
        let progress = curveFunc(i / config.divCount);

        let blurValue;
        if (config.exponential) {
            blurValue = Math.pow(2, progress * 4) * 0.0625 * config.strength;
        } else {
            blurValue = 0.0625 * (progress * config.divCount + 1) * config.strength;
        }

        const p1 = Math.round((increment * i - increment) * 10) / 10;
        const p2 = Math.round(increment * i * 10) / 10;
        const p3 = Math.round((increment * i + increment) * 10) / 10;
        const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

        let gradient = `transparent ${p1}%, black ${p2}%`;
        if (p3 <= 100) gradient += `, black ${p3}%`;
        if (p4 <= 100) gradient += `, transparent ${p4}%`;

        const maskImg = `linear-gradient(${direction}, ${gradient})`;

        const div = document.createElement('div');
        Object.assign(div.style, {
            position: 'absolute',
            inset: '0',
            maskImage: maskImg,
            WebkitMaskImage: maskImg,
            backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
            WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
            opacity: config.opacity
        });

        inner.appendChild(div);
    }

    container.appendChild(inner);
    parent.appendChild(container);

    // Cleanup
    return function cleanup() {
        container.remove();
    };
}
