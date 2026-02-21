/**
 * TextPressure – Vanilla JS port of the React TextPressure component.
 * Applies variable-font distortion based on mouse proximity to each character.
 * Original: https://codepen.io/JuanFuentes/full/rgXKGQ
 */

const dist = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance, maxDist, minVal, maxVal) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

export function initTextPressure(selector, options = {}) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;
  if (!container) return null;

  const {
    text = 'TerraShield',
    fontFamily = 'Compressa VF',
    width = true,
    weight = true,
    italic = true,
    alpha = false,
    flex = true,
    stroke = false,
    scale = false,
    textColor = '#1e293b',
    strokeColor = '#FF0000',
    minFontSize = 24
  } = options;

  // Clear container
  container.innerHTML = '';
  container.style.position = 'relative';
  container.style.width = '100%';
  container.style.overflow = 'visible';

  // Inject global styles
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .tp-flex {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
    }
    .tp-stroke span { position: relative; color: ${textColor}; }
    .tp-stroke span::after {
      content: attr(data-char);
      position: absolute; left: 0; top: 0;
      color: transparent; z-index: -1;
      -webkit-text-stroke-width: 3px;
      -webkit-text-stroke-color: ${strokeColor};
    }
  `;
  container.appendChild(styleEl);

  // Build the title element
  const h1 = document.createElement('h1');
  h1.className = 'text-pressure-title' + (flex ? ' tp-flex' : '') + (stroke ? ' tp-stroke' : '');
  h1.style.cssText = `
    font-family: '${fontFamily}', serif;
    text-transform: uppercase;
    line-height: 1.1;
    margin: 0;
    text-align: center;
    user-select: none;
    font-weight: 100;
    width: 100%;
    color: ${textColor};
    transform-origin: center top;
  `;

  // Split into words so we can wrap properly
  const words = text.split(' ');
  const chars = text.split('');
  const spans = [];

  words.forEach((word, wi) => {
    // Wrap each word in a span to keep words together
    const wordWrap = document.createElement('span');
    wordWrap.style.cssText = 'display:inline-block;white-space:nowrap;';

    word.split('').forEach(char => {
      const span = document.createElement('span');
      span.textContent = char;
      span.dataset.char = char;
      span.style.display = 'inline-block';
      if (!stroke) span.style.color = textColor;
      wordWrap.appendChild(span);
      spans.push(span);
    });

    h1.appendChild(wordWrap);

    // Add a space span between words (except after the last word)
    if (wi < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.textContent = '\u00A0';
      spaceSpan.style.cssText = 'display:inline-block;width:0.35em;';
      h1.appendChild(spaceSpan);
      spans.push(spaceSpan);
    }
  });

  container.appendChild(h1);

  // Mouse tracking
  const mouse = { x: 0, y: 0 };
  const cursor = { x: 0, y: 0 };

  const rect = container.getBoundingClientRect();
  mouse.x = cursor.x = rect.left + rect.width / 2;
  mouse.y = cursor.y = rect.top + rect.height / 2;

  const onMouseMove = e => { cursor.x = e.clientX; cursor.y = e.clientY; };
  const onTouchMove = e => { const t = e.touches[0]; cursor.x = t.clientX; cursor.y = t.clientY; };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('touchmove', onTouchMove, { passive: true });

  // Sizing – fit based on container width, allow wrapping
  function setSize() {
    const cw = container.getBoundingClientRect().width;
    // For longer text, compute so roughly 15-20 chars fit per line
    const charsPerLine = Math.min(chars.length, 20);
    let fs = cw / (charsPerLine * 0.55);
    fs = Math.max(fs, minFontSize);
    fs = Math.min(fs, 120); // cap at 120px
    h1.style.fontSize = fs + 'px';

    if (scale) {
      requestAnimationFrame(() => {
        const ch = container.getBoundingClientRect().height;
        const textH = h1.getBoundingClientRect().height;
        if (textH > 0 && ch > 0) {
          const yRatio = ch / textH;
          h1.style.transform = `scale(1, ${yRatio})`;
        }
      });
    }
  }

  let resizeTimer;
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(setSize, 100); };
  window.addEventListener('resize', onResize);
  setSize();

  // Animation loop
  let rafId;
  function animate() {
    mouse.x += (cursor.x - mouse.x) / 15;
    mouse.y += (cursor.y - mouse.y) / 15;

    const titleRect = h1.getBoundingClientRect();
    const maxDist = titleRect.width / 2;

    spans.forEach(span => {
      const r = span.getBoundingClientRect();
      if (r.width === 0) return;
      const center = { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      const d = dist(mouse, center);

      const wdth = width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100;
      const wght = weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400;
      const ital = italic ? getAttr(d, maxDist, 0, 1).toFixed(2) : 0;
      const alph = alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : 1;

      const fvs = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${ital}`;
      if (span.style.fontVariationSettings !== fvs) {
        span.style.fontVariationSettings = fvs;
      }
      if (alpha && span.style.opacity !== alph) {
        span.style.opacity = alph;
      }
    });

    rafId = requestAnimationFrame(animate);
  }
  animate();

  // Return cleanup function
  return function cleanup() {
    cancelAnimationFrame(rafId);
    clearTimeout(resizeTimer);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('resize', onResize);
  };
}
