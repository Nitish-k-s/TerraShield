// Home Page – TerraShield: Nature Journey (Sky → Forest → Pond → Waterfall → Deep Sea)
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';

export function renderHome() {
  return {
    html: `
  ${renderNavbar('home')}
  <main>
    <!-- ════════════════════════════════════════════
         BIOME 1 : SKY / SUNNY HERO
         ════════════════════════════════════════════ -->
    <section class="hero" id="hero-section">
      <div class="hero-bg">
        <div class="hero-sky" style="background:linear-gradient(180deg,#020804 0%,#060e08 30%,#0a1a0f 70%,#0d2818 100%)"></div>

        <!-- Rain overlay container (JS-spawned drops) -->
        <div id="hero-rain" style="position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden"></div>

        <!-- Creeping invasive vine from bottom-left -->
        <svg class="vine-corner" style="bottom:0;left:0;z-index:4;opacity:0.22;pointer-events:none" width="280" height="200" viewBox="0 0 280 200">
          <path d="M0,200 Q40,160 80,140 Q120,120 160,100 Q200,80 240,60 Q260,50 280,40" fill="none" stroke="#2d6e3a" stroke-width="3" stroke-dasharray="1000" stroke-dashoffset="1000" style="animation:vine-grow 12s ease-out 1s forwards"/>
          <circle cx="80" cy="140" r="6" fill="#3a8a4a" opacity="0.7"/>
          <circle cx="160" cy="100" r="5" fill="#4a9a5a" opacity="0.6"/>
          <circle cx="240" cy="60" r="4" fill="#3a8a4a" opacity="0.5"/>
          <!-- Micro leaves along the vine -->
          <ellipse cx="85" cy="134" rx="8" ry="4" fill="#2a6e3a" opacity="0.6" transform="rotate(-25 85 134)"/>
          <ellipse cx="165" cy="94" rx="7" ry="3.5" fill="#3a7e4a" opacity="0.5" transform="rotate(-40 165 94)"/>
        </svg>

        <!-- Ground mist at hero base -->
        <div class="mist-layer" style="height:80px;animation-duration:22s;"></div>

        <!-- Moon / forest night glow -->
        <div class="hero-sun" id="layer-sun" data-speed="0.03" style="z-index:1">
          <svg width="100%" height="100%" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="35" fill="rgba(200,230,200,0.12)" opacity="0.9"/>
            <circle cx="70" cy="70" r="50" fill="none" stroke="rgba(74,222,128,0.08)" stroke-width="1" style="animation:pulse-ring 4s ease-in-out infinite"/>
            <circle cx="70" cy="70" r="65" fill="none" stroke="rgba(74,222,128,0.04)" stroke-width="1" style="animation:pulse-ring 4s ease-in-out 1s infinite"/>
          </svg>
        </div>

        <!-- Dark mist clouds -->
        <svg style="position:absolute;top:12%;left:-10%;z-index:1;opacity:0.1;animation:drift-right 45s linear infinite" width="160" height="60" viewBox="0 0 160 60">
          <ellipse cx="80" cy="35" rx="70" ry="20" fill="rgba(74,222,128,0.2)" opacity="0.8"/>
          <ellipse cx="55" cy="30" rx="40" ry="18" fill="rgba(74,222,128,0.15)" opacity="0.6"/>
          <ellipse cx="110" cy="32" rx="35" ry="15" fill="rgba(74,222,128,0.1)" opacity="0.5"/>
        </svg>
        <svg style="position:absolute;top:8%;right:-5%;z-index:1;opacity:0.07;animation:drift-left 55s linear 5s infinite" width="120" height="50" viewBox="0 0 120 50">
          <ellipse cx="60" cy="28" rx="55" ry="18" fill="rgba(74,222,128,0.2)" opacity="0.7"/>
          <ellipse cx="40" cy="25" rx="30" ry="14" fill="rgba(74,222,128,0.15)" opacity="0.5"/>
        </svg>

        <!-- Subtle organic grid -->
        <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(74,122,58,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(74,122,58,0.03) 1px,transparent 1px);background-size:60px 60px;z-index:1;pointer-events:none"></div>

        <!-- Blinking alert dots -->
        <div class="alert-dot" style="top:30%;left:18%;animation-delay:0s;opacity:0.5"></div>
        <div class="alert-dot" style="top:40%;right:25%;animation-delay:1.5s;opacity:0.5"></div>
        <div class="alert-dot warning" style="top:45%;left:50%;animation-delay:0.8s;opacity:0.5"></div>

        <!-- Floating particles -->
        <div id="hero-particles" style="position:absolute;inset:0;pointer-events:none;z-index:2"></div>

        <!-- Mountain layers -->
        <div class="hero-mountains" id="layer-mountains" data-speed="0.06" style="z-index:3;animation:layer-wave-1 8s ease-in-out infinite">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1440 320" style="color:#061a0e;filter:var(--paper-layer-1)">
            <path d="M0,192L80,181.3C160,171,320,149,480,165.3C640,181,800,235,960,245.3C1120,256,1280,224,1360,208L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" fill="currentColor"></path>
          </svg>
        </div>
        <div class="hero-valley" id="layer-valley" data-speed="0.12" style="z-index:4;animation:layer-wave-2 6s ease-in-out 0.5s infinite">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1440 320" style="color:rgba(10,30,18,0.85);filter:var(--paper-layer-2)">
            <path d="M0,224L60,213.3C120,203,240,181,360,192C480,203,600,245,720,250.7C840,256,960,224,1080,202.7C1200,181,1320,171,1380,165.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" fill="currentColor"></path>
          </svg>
        </div>
        <div class="hero-forest" id="layer-forest" data-speed="0.2" style="z-index:5;animation:layer-wave-3 5s ease-in-out 1s infinite">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1440 320" style="color:var(--color-paper-forest);filter:var(--paper-layer-3)">
            <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="currentColor"></path>
          </svg>
          <!-- Trees -->
          <svg style="position:absolute;bottom:40%;left:15%;opacity:0.4;animation:tree-sway 5s ease-in-out infinite" width="20" height="30" viewBox="0 0 20 30">
            <polygon points="10,0 0,20 20,20" fill="#3a4e3e"/><rect x="8" y="20" width="4" height="10" fill="#5a4a3a"/>
          </svg>
          <svg style="position:absolute;bottom:42%;right:25%;opacity:0.35;animation:tree-sway 4.5s ease-in-out 0.5s infinite" width="18" height="27" viewBox="0 0 20 30">
            <polygon points="10,0 0,20 20,20" fill="#3a4e3e"/><rect x="8" y="20" width="4" height="10" fill="#5a4a3a"/>
          </svg>
        </div>
      </div>

      <!-- Hero Content -->
      <div class="hero-content" id="hero-content-wrap" style="z-index:10">
        <div class="hero-animate" style="margin-bottom:var(--space-4)">
          <span style="font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;padding:var(--space-2) var(--space-4);background:rgba(74,122,58,0.1);border:1px solid rgba(74,122,58,0.2);border-radius:var(--radius-full);color:#4a7a3a;font-weight:var(--fw-bold);display:inline-flex;align-items:center;gap:var(--space-2)">
            <span class="material-symbols-outlined" style="font-size:0.875rem">eco</span>
            Nature-Powered Ecological Intelligence
          </span>
        </div>

        <h1 class="hero-title hero-animate font-serif">Detect invasive species<br>before they spread.</h1>
        <p class="hero-subtitle hero-animate-delay">TerraShield combines citizen-submitted geo-tagged photos with AI classification and satellite vegetation analysis to identify invasive outbreaks 6–12 months earlier than traditional field surveys.</p>

        <div class="hero-buttons hero-animate-delay-2">
          <a href="#/report" class="btn btn-primary btn-lg btn-micro">
            <span class="material-symbols-outlined" style="font-size:1.125rem">photo_camera</span> Report a Sighting
          </a>
          <a href="#/alerts" class="btn btn-lg btn-micro" style="border:1px solid rgba(74,222,128,0.3);color:#4ade80;background:rgba(74,222,128,0.06)">
            <span class="material-symbols-outlined" style="font-size:1.125rem">park</span> Explore Ecosystem Map
          </a>
        </div>

        <p class="hero-animate-delay-2" style="margin-top:var(--space-6);font-size:0.75rem;color:var(--color-slate-400);letter-spacing:0.05em">Real-time ecological intelligence powered by AI and remote sensing.</p>

        <!-- Scroll indicator -->
        <div class="hero-animate-delay-2" style="margin-top:var(--space-12);animation:bounce-slow 2s ease-in-out infinite">
          <a href="#how-it-works" style="display:flex;flex-direction:column;align-items:center;gap:var(--space-2);color:var(--color-slate-400);font-size:0.625rem;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.15em">
            <span>How it works</span>
            <span class="material-symbols-outlined" style="font-size:1.25rem">expand_more</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ════════════════════════════════════════════
         BIOME 2 : FOREST + BIRDS
         ════════════════════════════════════════════ -->
    <section id="how-it-works" style="position:relative;overflow:hidden;background:linear-gradient(180deg,#2d4a37 0%,#1e3a2a 40%,#1b3526 70%,#1a3324 100%);padding:var(--space-20) 0;color:#fff">

      <!-- Canopy top edge -->
      <svg style="position:absolute;top:-1px;width:100%;z-index:3" preserveAspectRatio="none" viewBox="0 0 1440 100" height="60">
        <path d="M0,0L0,60 C180,30 360,80 540,50 C720,20 900,70 1080,40 C1200,20 1350,50 1440,30 L1440,0Z" fill="var(--color-paper-forest)"/>
      </svg>

      <!-- ── TALL TREE SILHOUETTES (left side) ── -->
      <div style="position:absolute;top:0;left:0;bottom:0;width:20%;pointer-events:none;z-index:2;opacity:0.5">
        <svg viewBox="0 0 200 800" preserveAspectRatio="xMinYMin meet" width="100%" height="100%">
          <!-- Pine tree 1 -->
          <polygon points="80,30 40,180 120,180" fill="#14291e"/>
          <polygon points="80,100 30,280 130,280" fill="#162e20"/>
          <polygon points="80,200 20,380 140,380" fill="#14291e"/>
          <rect x="68" y="380" width="24" height="80" fill="#1a1a10"/>
          <!-- Pine tree 2 -->
          <polygon points="150,120 110,270 190,270" fill="#0f2418"/>
          <polygon points="150,200 100,380 200,380" fill="#112616"/>
          <rect x="140" y="380" width="20" height="70" fill="#161610"/>
          <!-- Bush cluster at base -->
          <ellipse cx="60" cy="470" rx="55" ry="25" fill="#14291e"/>
          <ellipse cx="140" cy="480" rx="50" ry="20" fill="#112616"/>
          <!-- Fern -->
          <path d="M30,500 Q50,460 70,480 Q50,470 30,500" fill="#1a3a22" opacity="0.8"/>
        </svg>
      </div>
      <!-- ── TALL TREE SILHOUETTES (right side) ── -->
      <div style="position:absolute;top:0;right:0;bottom:0;width:18%;pointer-events:none;z-index:2;opacity:0.45;transform:scaleX(-1)">
        <svg viewBox="0 0 200 800" preserveAspectRatio="xMinYMin meet" width="100%" height="100%">
          <polygon points="90,50 45,220 135,220" fill="#14291e"/>
          <polygon points="90,140 35,350 145,350" fill="#112616"/>
          <rect x="78" y="350" width="24" height="75" fill="#1a1a10"/>
          <polygon points="160,100 125,250 195,250" fill="#0f2418"/>
          <polygon points="160,180 115,360 200,360" fill="#14291e"/>
          <rect x="150" y="360" width="20" height="65" fill="#161610"/>
          <ellipse cx="80" cy="440" rx="60" ry="22" fill="#14291e"/>
          <ellipse cx="160" cy="430" rx="40" ry="18" fill="#112616"/>
        </svg>
      </div>

      <!-- ── Hanging vines ── -->
      <svg style="position:absolute;top:0;left:12%;z-index:3;opacity:0.25;pointer-events:none" width="30" height="200" viewBox="0 0 30 200">
        <path d="M15,0 Q10,50 18,100 Q12,150 15,200" fill="none" stroke="#2a5a3a" stroke-width="2"/>
        <circle cx="15" cy="200" r="4" fill="#3a7a4a" opacity="0.6"><animate attributeName="cy" values="200;195;200" dur="3s" repeatCount="indefinite"/></circle>
      </svg>
      <svg style="position:absolute;top:0;right:15%;z-index:3;opacity:0.2;pointer-events:none" width="25" height="160" viewBox="0 0 25 160">
        <path d="M12,0 Q8,40 16,80 Q10,120 12,160" fill="none" stroke="#2a5a3a" stroke-width="1.5"/>
        <circle cx="12" cy="160" r="3" fill="#3a7a4a" opacity="0.5"><animate attributeName="cy" values="160;155;160" dur="3.5s" repeatCount="indefinite"/></circle>
      </svg>

      <!-- ── ANIMATED BIRDS (large + visible) ── -->
      <svg class="forest-bird" style="position:absolute;top:8%;left:15%;z-index:6;opacity:0.55;animation:bird-fly 14s ease-in-out infinite" width="60" height="24" viewBox="0 0 30 14">
        <path d="M0,7 Q7,0 15,7 Q23,0 30,7" fill="none" stroke="#b0dcc0" stroke-width="2" stroke-linecap="round">
          <animate attributeName="d" values="M0,7 Q7,0 15,7 Q23,0 30,7;M0,7 Q7,5 15,7 Q23,5 30,7;M0,7 Q7,0 15,7 Q23,0 30,7" dur="0.8s" repeatCount="indefinite"/>
        </path>
      </svg>
      <svg class="forest-bird" style="position:absolute;top:6%;left:28%;z-index:6;opacity:0.45;animation:bird-fly 16s ease-in-out 1s infinite" width="50" height="20" viewBox="0 0 30 14">
        <path d="M0,7 Q7,0 15,7 Q23,0 30,7" fill="none" stroke="#a0ccb0" stroke-width="2" stroke-linecap="round">
          <animate attributeName="d" values="M0,7 Q7,0 15,7 Q23,0 30,7;M0,7 Q7,5 15,7 Q23,5 30,7;M0,7 Q7,0 15,7 Q23,0 30,7" dur="0.9s" repeatCount="indefinite"/>
        </path>
      </svg>
      <svg class="forest-bird" style="position:absolute;top:12%;right:22%;z-index:6;opacity:0.5;animation:bird-fly 12s ease-in-out 3s infinite" width="55" height="22" viewBox="0 0 30 14">
        <path d="M0,7 Q7,0 15,7 Q23,0 30,7" fill="none" stroke="#c0e8d0" stroke-width="2" stroke-linecap="round">
          <animate attributeName="d" values="M0,7 Q7,0 15,7 Q23,0 30,7;M0,7 Q7,5 15,7 Q23,5 30,7;M0,7 Q7,0 15,7 Q23,0 30,7" dur="0.7s" repeatCount="indefinite"/>
        </path>
      </svg>
      <svg class="forest-bird" style="position:absolute;top:4%;left:50%;z-index:6;opacity:0.35;animation:bird-fly 20s ease-in-out 5s infinite" width="40" height="16" viewBox="0 0 30 14">
        <path d="M0,7 Q7,0 15,7 Q23,0 30,7" fill="none" stroke="#90c0a8" stroke-width="1.5" stroke-linecap="round">
          <animate attributeName="d" values="M0,7 Q7,0 15,7 Q23,0 30,7;M0,7 Q7,4 15,7 Q23,4 30,7;M0,7 Q7,0 15,7 Q23,0 30,7" dur="1s" repeatCount="indefinite"/>
        </path>
      </svg>
      <svg class="forest-bird" style="position:absolute;top:10%;right:40%;z-index:6;opacity:0.4;animation:bird-fly 18s ease-in-out 7s infinite" width="45" height="18" viewBox="0 0 30 14">
        <path d="M0,7 Q7,0 15,7 Q23,0 30,7" fill="none" stroke="#b0dcc0" stroke-width="1.5" stroke-linecap="round">
          <animate attributeName="d" values="M0,7 Q7,0 15,7 Q23,0 30,7;M0,7 Q7,5 15,7 Q23,5 30,7;M0,7 Q7,0 15,7 Q23,0 30,7" dur="0.85s" repeatCount="indefinite"/>
        </path>
      </svg>

      <!-- ── Fireflies / forest particles ── -->
      <div id="forest-particles" style="position:absolute;inset:0;pointer-events:none;z-index:3"></div>

      <!-- ── Dappled light rays (brighter) ── -->
      <div style="position:absolute;top:0;left:25%;width:180px;height:100%;background:linear-gradient(180deg,rgba(255,255,200,0.08),transparent 60%);transform:skewX(-12deg);pointer-events:none;z-index:1;animation:light-ray-drift 10s ease-in-out infinite"></div>
      <div style="position:absolute;top:0;left:55%;width:140px;height:100%;background:linear-gradient(180deg,rgba(255,255,200,0.06),transparent 50%);transform:skewX(8deg);pointer-events:none;z-index:1;animation:light-ray-drift 14s ease-in-out 3s infinite reverse"></div>
      <div style="position:absolute;top:0;left:75%;width:100px;height:100%;background:linear-gradient(180deg,rgba(255,255,200,0.05),transparent 45%);transform:skewX(-6deg);pointer-events:none;z-index:1;animation:light-ray-drift 12s ease-in-out 6s infinite"></div>

      <!-- ── Falling leaves (JavaScript-spawned) ── -->
      <div id="falling-leaves" style="position:absolute;inset:0;pointer-events:none;z-index:4;overflow:hidden"></div>

      <!-- ── Invasive Lantana camara flower clusters (orange/red, invasive at forest floor) ── -->
      <svg style="position:absolute;bottom:6%;left:25%;z-index:3;opacity:0.45;pointer-events:none;animation:hyacinth-sway 5s ease-in-out infinite" width="110" height="90" viewBox="0 0 110 90">
        <!-- Stems -->
        <line x1="30" y1="90" x2="28" y2="50" stroke="#3a6a28" stroke-width="2"/>
        <line x1="55" y1="90" x2="57" y2="40" stroke="#3a6a28" stroke-width="2"/>
        <line x1="80" y1="90" x2="78" y2="55" stroke="#3a6a28" stroke-width="2"/>
        <!-- Lantana flower clusters (small orange-red-yellow) -->
        <g transform="translate(22,38)">
          <circle cx="0" cy="0" r="4" fill="#ef6a20" opacity="0.85"/>
          <circle cx="7" cy="-3" r="3.5" fill="#f0a030" opacity="0.8"/>
          <circle cx="-6" cy="-4" r="3" fill="#e04010" opacity="0.75"/>
          <circle cx="4" cy="6" r="3" fill="#f0c040" opacity="0.7"/>
        </g>
        <g transform="translate(53,28)">
          <circle cx="0" cy="0" r="5" fill="#ef6a20" opacity="0.9"/>
          <circle cx="8" cy="-4" r="4" fill="#f0a030" opacity="0.8"/>
          <circle cx="-7" cy="-3" r="3.5" fill="#e04010" opacity="0.75"/>
          <circle cx="3" cy="7" r="3.5" fill="#f0c040" opacity="0.7"/>
        </g>
        <g transform="translate(74,43)">
          <circle cx="0" cy="0" r="3.5" fill="#ef6a20" opacity="0.8"/>
          <circle cx="6" cy="-3" r="3" fill="#f0a030" opacity="0.75"/>
          <circle cx="-5" cy="-2" r="2.5" fill="#e04010" opacity="0.7"/>
        </g>
        <!-- Invasive tag -->
        <foreignObject x="0" y="-16" width="110" height="20">
          <div xmlns="http://www.w3.org/1999/xhtml" class="invasive-tag" style="font-size:0.45rem;padding:1px 6px">Lantana camara · Invasive</div>
        </foreignObject>
      </svg>

      <!-- ── Invasive creeping vine (Mikania micrantha) along the forest floor ── -->
      <svg style="position:absolute;bottom:0;left:0;right:0;z-index:3;opacity:0.3;pointer-events:none" width="100%" height="80" viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0,80 Q60,40 120,60 Q200,30 280,55 Q360,25 440,50 Q520,30 600,55 Q680,35 760,50 Q840,25 920,55 Q1000,30 1080,50 Q1160,40 1240,55 Q1320,30 1380,50 Q1420,40 1440,45 L1440,80Z" fill="#1e3a18" style="animation:hyacinth-sway 8s ease-in-out infinite"/>
        <!-- Vine tendrils -->
        <path d="M200,55 Q210,30 230,45" fill="none" stroke="#2a5a28" stroke-width="1.5" opacity="0.6"/>
        <path d="M500,50 Q510,25 530,40" fill="none" stroke="#2a5a28" stroke-width="1.5" opacity="0.5"/>
        <path d="M850,55 Q860,28 880,42" fill="none" stroke="#2a5a28" stroke-width="1.5" opacity="0.6"/>
        <path d="M1200,50 Q1210,28 1230,40" fill="none" stroke="#2a5a28" stroke-width="1.5" opacity="0.5"/>
      </svg>

      <!-- ── Dragonfly (enhanced with figure-8 path) ── -->
      <svg style="position:absolute;top:20%;right:18%;z-index:5;opacity:0.4;animation:dragonfly-hover 7s ease-in-out infinite" width="54" height="32" viewBox="0 0 54 32">
        <line x1="4" y1="16" x2="50" y2="16" stroke="#60b8a8" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="50" cy="16" rx="5" ry="3.5" fill="#60b8a8"/>
        <circle cx="50" cy="14" r="1.2" fill="#1a4a3c"/>
        <!-- Upper wings -->
        <ellipse cx="24" cy="8" rx="14" ry="5" fill="rgba(120,220,200,0.25)" stroke="rgba(80,180,160,0.4)" stroke-width="0.8" transform="rotate(-12 24 8)"><animate attributeName="ry" values="5;2;5" dur="0.12s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="24" cy="24" rx="14" ry="5" fill="rgba(120,220,200,0.2)" stroke="rgba(80,180,160,0.35)" stroke-width="0.8" transform="rotate(12 24 24)"><animate attributeName="ry" values="5;2;5" dur="0.12s" repeatCount="indefinite"/></ellipse>
        <!-- Abdomen segments -->
        <line x1="10" y1="16" x2="18" y2="16" stroke="#4a9888" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="20" y1="16" x2="28" y2="16" stroke="#5aaa98" stroke-width="2" stroke-linecap="round"/>
        <line x1="30" y1="16" x2="38" y2="16" stroke="#4a9888" stroke-width="1.5" stroke-linecap="round"/>
      </svg>

      <!-- ── Spore particles container (JS-spawned) ── -->
      <div id="spore-particles" style="position:absolute;inset:0;pointer-events:none;z-index:4;overflow:hidden"></div>

      <!-- Content: How it works -->
      <div class="container" style="position:relative;z-index:10">
        <div class="section-header reveal" style="margin-bottom:var(--space-16)">
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#6ec89b;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-3);display:inline-block">Detection Pipeline</span>
          <h2 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:var(--fw-bold);text-align:center;color:#fff;margin-bottom:var(--space-3)">How Early Detection Works</h2>
          <div style="width:3rem;height:2px;background:#6ec89b;margin:0 auto;border-radius:2px"></div>
        </div>

        <div class="four-col-grid">
          <div class="card hover-lift reveal" data-delay="0" style="text-align:center;padding:var(--space-8) var(--space-6);background:rgba(255,255,255,0.06);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08)">
            <div style="width:3.5rem;height:3.5rem;border-radius:50%;background:rgba(110,200,155,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4)">
              <span class="material-symbols-outlined" style="color:#6ec89b;font-size:1.5rem">photo_camera</span>
            </div>
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#6ec89b;text-transform:uppercase;letter-spacing:0.1em">Step 01</span>
            <h3 style="margin-top:var(--space-2);font-weight:var(--fw-bold);color:#fff">Citizen Reporting</h3>
            <p style="color:rgba(255,255,255,0.6);font-size:0.8125rem;line-height:1.7;margin-top:var(--space-2)">Users upload geo-tagged photos of suspicious plants or animals observed in the field.</p>
          </div>

          <div class="card hover-lift reveal" data-delay="100" style="text-align:center;padding:var(--space-8) var(--space-6);background:rgba(255,255,255,0.06);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08)">
            <div style="width:3.5rem;height:3.5rem;border-radius:50%;background:rgba(110,200,155,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4)">
              <span class="material-symbols-outlined" style="color:#6ec89b;font-size:1.5rem">smart_toy</span>
            </div>
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#6ec89b;text-transform:uppercase;letter-spacing:0.1em">Step 02</span>
            <h3 style="margin-top:var(--space-2);font-weight:var(--fw-bold);color:#fff">AI Species Identification</h3>
            <p style="color:rgba(255,255,255,0.6);font-size:0.8125rem;line-height:1.7;margin-top:var(--space-2)">Our AI analyzes the image, identifies the species, estimates confidence, and determines invasive status.</p>
          </div>

          <div class="card hover-lift reveal" data-delay="200" style="text-align:center;padding:var(--space-8) var(--space-6);background:rgba(255,255,255,0.06);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08)">
            <div style="width:3.5rem;height:3.5rem;border-radius:50%;background:rgba(110,200,155,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4)">
              <span class="material-symbols-outlined" style="color:#6ec89b;font-size:1.5rem">satellite_alt</span>
            </div>
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#6ec89b;text-transform:uppercase;letter-spacing:0.1em">Step 03</span>
            <h3 style="margin-top:var(--space-2);font-weight:var(--fw-bold);color:#fff">Satellite Change Detection</h3>
            <p style="color:rgba(255,255,255,0.6);font-size:0.8125rem;line-height:1.7;margin-top:var(--space-2)">Satellite vegetation indices detect abnormal land-cover or growth patterns in the same area.</p>
          </div>

          <div class="card hover-lift reveal" data-delay="300" style="text-align:center;padding:var(--space-8) var(--space-6);background:rgba(255,255,255,0.06);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08)">
            <div style="width:3.5rem;height:3.5rem;border-radius:50%;background:rgba(110,200,155,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4)">
              <span class="material-symbols-outlined" style="color:#6ec89b;font-size:1.5rem">assessment</span>
            </div>
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#6ec89b;text-transform:uppercase;letter-spacing:0.1em">Step 04</span>
            <h3 style="margin-top:var(--space-2);font-weight:var(--fw-bold);color:#fff">Correlated Risk Scoring</h3>
            <p style="color:rgba(255,255,255,0.6);font-size:0.8125rem;line-height:1.7;margin-top:var(--space-2)">Citizen clusters and satellite anomalies combine to generate outbreak risk scores and trigger alerts.</p>
          </div>
        </div>
      </div>

      <!-- Forest floor / pond transition -->
      <svg style="position:absolute;bottom:-1px;width:100%;z-index:5" preserveAspectRatio="none" viewBox="0 0 1440 100" height="60">
        <path d="M0,100L0,40 C200,70 400,20 600,50 C800,80 1000,30 1200,50 C1350,65 1420,45 1440,40 L1440,100Z" fill="#2a5c4e"/>
      </svg>
    </section>

    <!-- ════════════════════════════════════════════
         BIOME 3 : POND / LAKE
         ════════════════════════════════════════════ -->
    <section style="position:relative;overflow:hidden;background:linear-gradient(180deg,#2a5c4e 0%,#1a4a3c 15%,#1c5f5a 40%,#175a58 60%,#135050 100%);padding:var(--space-20) 0;color:#fff">

      <!-- Rain impact ripples on water surface -->
      <div id="rain-ripples" style="position:absolute;bottom:15%;left:0;right:0;height:30%;pointer-events:none;z-index:4;overflow:hidden"></div>

      <!-- River shimmer streaks -->
      <div style="position:absolute;bottom:12%;left:0;right:0;height:90px;overflow:hidden;pointer-events:none;z-index:2">
        <div style="position:absolute;top:20px;left:0;width:200px;height:3px;background:linear-gradient(90deg,transparent,rgba(120,210,200,0.3),transparent);animation:river-flow 8s linear infinite"></div>
        <div style="position:absolute;top:40px;left:0;width:150px;height:2px;background:linear-gradient(90deg,transparent,rgba(100,190,180,0.25),transparent);animation:river-flow 11s linear 2s infinite"></div>
        <div style="position:absolute;top:60px;left:0;width:180px;height:2px;background:linear-gradient(90deg,transparent,rgba(140,220,210,0.2),transparent);animation:river-flow 9.5s linear 4s infinite"></div>
      </div>

      <!-- ── LILY PADS (large + visible with flowers) ── -->
      <svg style="position:absolute;bottom:18%;left:5%;z-index:2;opacity:0.35;animation:lily-bob 4s ease-in-out infinite" width="120" height="60" viewBox="0 0 120 60">
        <ellipse cx="60" cy="35" rx="55" ry="22" fill="#2a7a5e"/>
        <path d="M60,13 L60,35" stroke="#1c6a4c" stroke-width="2"/>
        <ellipse cx="60" cy="35" rx="50" ry="18" fill="#35906a" opacity="0.6"/>
        <!-- Lotus flower -->
        <ellipse cx="58" cy="18" rx="8" ry="5" fill="#e8a0c0" opacity="0.7"/>
        <ellipse cx="62" cy="16" rx="6" ry="4" fill="#f0b0d0" opacity="0.5"/>
      </svg>
      <svg style="position:absolute;bottom:28%;right:8%;z-index:2;opacity:0.3;animation:lily-bob 5s ease-in-out 1s infinite" width="100" height="50" viewBox="0 0 100 50">
        <ellipse cx="50" cy="30" rx="45" ry="18" fill="#2a7a5e"/>
        <ellipse cx="50" cy="30" rx="40" ry="14" fill="#35906a" opacity="0.5"/>
        <path d="M50,12 L50,30" stroke="#1c6a4c" stroke-width="1.5"/>
      </svg>
      <svg style="position:absolute;bottom:22%;left:55%;z-index:2;opacity:0.25;animation:lily-bob 4.5s ease-in-out 2s infinite" width="80" height="40" viewBox="0 0 80 40">
        <ellipse cx="40" cy="24" rx="36" ry="14" fill="#2a7a5e"/>
        <ellipse cx="40" cy="24" rx="30" ry="10" fill="#35906a" opacity="0.4"/>
      </svg>

      <!-- ── Pond reeds at edges ── -->
      <svg style="position:absolute;bottom:0;left:3%;z-index:4;opacity:0.3;pointer-events:none" width="60" height="250" viewBox="0 0 60 250">
        <line x1="15" y1="250" x2="12" y2="40" stroke="#2a5a3a" stroke-width="2.5"/>
        <line x1="30" y1="250" x2="33" y2="60" stroke="#2a5a3a" stroke-width="2"/>
        <line x1="45" y1="250" x2="42" y2="30" stroke="#2a5a3a" stroke-width="2.5"/>
        <ellipse cx="12" cy="38" rx="5" ry="12" fill="#3a5a3a" opacity="0.8"/>
        <ellipse cx="42" cy="28" rx="4" ry="10" fill="#3a5a3a" opacity="0.7"/>
      </svg>
      <svg style="position:absolute;bottom:0;right:2%;z-index:4;opacity:0.25;pointer-events:none" width="50" height="220" viewBox="0 0 50 220">
        <line x1="12" y1="220" x2="15" y2="50" stroke="#2a5a3a" stroke-width="2"/>
        <line x1="28" y1="220" x2="25" y2="35" stroke="#2a5a3a" stroke-width="2.5"/>
        <line x1="40" y1="220" x2="38" y2="55" stroke="#2a5a3a" stroke-width="2"/>
        <ellipse cx="25" cy="33" rx="5" ry="11" fill="#3a5a3a" opacity="0.8"/>
      </svg>

      <!-- ── Water hyacinth invasive mat (left side) ── -->
      <svg style="position:absolute;bottom:10%;left:8%;z-index:3;opacity:0.5;animation:hyacinth-sway 4s ease-in-out 0.5s infinite;pointer-events:none" width="160" height="80" viewBox="0 0 160 80">
        <!-- Bulbous floating stems -->
        <ellipse cx="30" cy="60" rx="14" ry="8" fill="#2a7a5e"/>
        <ellipse cx="60" cy="55" rx="16" ry="9" fill="#35906a"/>
        <ellipse cx="90" cy="58" rx="13" ry="7" fill="#2a7a5e"/>
        <ellipse cx="118" cy="56" rx="15" ry="8" fill="#35906a" opacity="0.9"/>
        <ellipse cx="145" cy="60" rx="12" ry="6" fill="#2a7a5e" opacity="0.8"/>
        <!-- Hyacinth flowers (purple, invasive signature) -->
        <g transform="translate(28,40)">
          <ellipse cx="0" cy="0" rx="5" ry="8" fill="#9060c0" opacity="0.8"/>
          <ellipse cx="-6" cy="2" rx="4" ry="7" fill="#a070d0" opacity="0.7"/>
          <ellipse cx="6" cy="2" rx="4" ry="7" fill="#8050b0" opacity="0.75"/>
          <circle cx="0" cy="-6" r="2.5" fill="#c0a0e0" opacity="0.6"/>
        </g>
        <g transform="translate(60,38)">
          <ellipse cx="0" cy="0" rx="6" ry="9" fill="#9060c0" opacity="0.85"/>
          <ellipse cx="-7" cy="3" rx="5" ry="8" fill="#a070d0" opacity="0.75"/>
          <ellipse cx="7" cy="3" rx="5" ry="7" fill="#8050b0" opacity="0.8"/>
          <circle cx="0" cy="-7" r="3" fill="#c0a0e0" opacity="0.65"/>
        </g>
        <g transform="translate(118,40)">
          <ellipse cx="0" cy="0" rx="5" ry="8" fill="#9060c0" opacity="0.75"/>
          <ellipse cx="-5" cy="2" rx="4" ry="6" fill="#a070d0" opacity="0.7"/>
          <circle cx="0" cy="-5" r="2" fill="#c0a0e0" opacity="0.6"/>
        </g>
        <!-- Invasive label -->
        <foreignObject x="10" y="20" width="140" height="18">
          <div xmlns="http://www.w3.org/1999/xhtml" class="invasive-tag" style="font-size:0.42rem;padding:1px 5px">Water Hyacinth · Invasive</div>
        </foreignObject>
      </svg>

      <!-- ── Smaller water hyacinth mat (right) ── -->
      <svg style="position:absolute;bottom:20%;right:5%;z-index:3;opacity:0.4;animation:hyacinth-sway 5s ease-in-out 1.5s infinite;pointer-events:none" width="110" height="60" viewBox="0 0 110 60">
        <ellipse cx="22" cy="46" rx="12" ry="7" fill="#2a7a5e"/>
        <ellipse cx="50" cy="42" rx="14" ry="8" fill="#35906a"/>
        <ellipse cx="80" cy="45" rx="12" ry="6" fill="#2a7a5e" opacity="0.9"/>
        <g transform="translate(22,28)"><ellipse cx="0" cy="0" rx="4" ry="7" fill="#9060c0" opacity="0.8"/><ellipse cx="-5" cy="2" rx="3" ry="6" fill="#a070d0" opacity="0.7"/></g>
        <g transform="translate(50,24)"><ellipse cx="0" cy="0" rx="5" ry="8" fill="#8858b8" opacity="0.85"/><ellipse cx="6" cy="3" rx="4" ry="6" fill="#9868c8" opacity="0.75"/></g>
      </svg>

      <!-- ── Water surface shimmer ── -->
      <div style="position:absolute;bottom:0;left:0;right:0;height:40%;background:linear-gradient(180deg,transparent,rgba(20,80,90,0.3));pointer-events:none;z-index:1;animation:water-shimmer 6s ease-in-out infinite"></div>

      <!-- ── Animated ripple rings (more visible) ── -->
      <svg style="position:absolute;bottom:15%;left:30%;z-index:3;opacity:0.2" width="200" height="60" viewBox="0 0 200 60">
        <ellipse cx="100" cy="30" rx="30" ry="8" fill="none" stroke="#7ec8c0" stroke-width="1">
          <animate attributeName="rx" values="30;90;30" dur="5s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="8;20;8" dur="5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0;0.5" dur="5s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="100" cy="30" rx="15" ry="4" fill="none" stroke="#7ec8c0" stroke-width="1">
          <animate attributeName="rx" values="15;60;15" dur="5s" begin="1s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="4;15;4" dur="5s" begin="1s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.4;0;0.4" dur="5s" begin="1s" repeatCount="indefinite"/>
        </ellipse>
      </svg>
      <svg style="position:absolute;bottom:25%;right:30%;z-index:3;opacity:0.15" width="160" height="50" viewBox="0 0 160 50">
        <ellipse cx="80" cy="25" rx="20" ry="6" fill="none" stroke="#7ec8c0" stroke-width="0.8">
          <animate attributeName="rx" values="20;70;20" dur="6s" begin="2s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="6;18;6" dur="6s" begin="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.4;0;0.4" dur="6s" begin="2s" repeatCount="indefinite"/>
        </ellipse>
      </svg>

      <!-- ── DRAGONFLY ── -->
      <svg style="position:absolute;top:15%;left:40%;z-index:5;opacity:0.3;animation:bird-fly 22s ease-in-out infinite" width="50" height="30" viewBox="0 0 50 30">
        <line x1="5" y1="15" x2="45" y2="15" stroke="#60b0a0" stroke-width="2"/>
        <ellipse cx="45" cy="15" rx="4" ry="3" fill="#60b0a0"/>
        <!-- Wings -->
        <ellipse cx="22" cy="8" rx="12" ry="4" fill="rgba(150,220,200,0.3)" transform="rotate(-10 22 8)"><animate attributeName="ry" values="4;2;4" dur="0.15s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="22" cy="22" rx="12" ry="4" fill="rgba(150,220,200,0.3)" transform="rotate(10 22 22)"><animate attributeName="ry" values="4;2;4" dur="0.15s" repeatCount="indefinite"/></ellipse>
      </svg>

      <!-- ── Frog on lily pad ── -->
      <svg style="position:absolute;bottom:22%;left:22%;z-index:4;opacity:0.45;pointer-events:none;animation:frog-idle 3s ease-in-out infinite" width="36" height="28" viewBox="0 0 36 28">
        <!-- Body -->
        <ellipse cx="18" cy="18" rx="12" ry="9" fill="#2a7a3e"/>
        <!-- Head -->
        <ellipse cx="18" cy="10" rx="9" ry="7" fill="#3a8a4e"/>
        <!-- Eyes -->
        <circle cx="12" cy="8" r="3.5" fill="#4aaa5e"/><circle cx="12" cy="8" r="2" fill="#1a3a1e"/>
        <circle cx="24" cy="8" r="3.5" fill="#4aaa5e"/><circle cx="24" cy="8" r="2" fill="#1a3a1e"/>
        <!-- Eye shine -->
        <circle cx="13" cy="7" r="0.8" fill="#fff" opacity="0.7"/>
        <circle cx="25" cy="7" r="0.8" fill="#fff" opacity="0.7"/>
        <!-- Front legs -->
        <line x1="8" y1="20" x2="2" y2="26" stroke="#2a7a3e" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="28" y1="20" x2="34" y2="26" stroke="#2a7a3e" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Mouth line -->
        <path d="M13,14 Q18,17 23,14" fill="none" stroke="#1a5a2e" stroke-width="1" stroke-linecap="round"/>
      </svg>

      <!-- ── SWIMMING FISH (large + visible) ── -->
      <svg style="position:absolute;bottom:8%;left:10%;z-index:2;opacity:0.2;animation:fish-swim 18s linear infinite" width="70" height="30" viewBox="0 0 70 30">
        <path d="M0,15 C10,5 22,5 40,15 C22,25 10,25 0,15Z" fill="#5ab8a8"/>
        <polygon points="40,15 58,5 58,25" fill="#5ab8a8"/>
        <circle cx="12" cy="13" r="2" fill="#1a4a3c"/>
      </svg>
      <svg style="position:absolute;bottom:14%;right:15%;z-index:2;opacity:0.15;animation:fish-swim 22s linear 3s infinite reverse" width="55" height="24" viewBox="0 0 70 30">
        <path d="M0,15 C10,5 22,5 40,15 C22,25 10,25 0,15Z" fill="#4aa898"/>
        <polygon points="40,15 58,5 58,25" fill="#4aa898"/>
        <circle cx="12" cy="13" r="2" fill="#1a4a3c"/>
      </svg>
      <svg style="position:absolute;bottom:5%;left:45%;z-index:2;opacity:0.12;animation:fish-swim 25s linear 6s infinite" width="45" height="20" viewBox="0 0 70 30">
        <path d="M0,15 C10,5 22,5 40,15 C22,25 10,25 0,15Z" fill="#5ab8a8"/>
        <polygon points="40,15 58,5 58,25" fill="#4aa898"/>
        <circle cx="12" cy="13" r="1.5" fill="#1a4a3c"/>
      </svg>

      <!-- Content: Live Alerts -->
      <div class="container" style="position:relative;z-index:10">
        <div class="section-header reveal" style="margin-bottom:var(--space-12)">
          <div style="display:inline-flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3)">
            <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#ef4444;animation:pulse-glow-red 2s infinite"></span>
            <span style="font-size:0.7rem;font-weight:var(--fw-bold);color:#ef4444;text-transform:uppercase;letter-spacing:0.12em">Live Monitoring</span>
          </div>
          <h2 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:var(--fw-bold);text-align:center;color:#fff;margin-bottom:var(--space-3)">Active Ecological Alerts</h2>
          <p style="text-align:center;color:rgba(255,255,255,0.55);max-width:36rem;margin:0 auto;font-size:0.9375rem;line-height:1.7">Emerging clusters are continuously monitored. High-confidence outbreak zones are flagged in real time.</p>
        </div>

        <div class="three-col-grid" style="margin-bottom:var(--space-10)">
          <div class="card hover-lift reveal" data-delay="0" style="padding:var(--space-6);border-left:3px solid #ef4444;background:rgba(255,255,255,0.06);backdrop-filter:blur(8px);border-top:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06)">
            <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3)">
              <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#ef4444"></span>
              <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#ef4444;text-transform:uppercase;letter-spacing:0.08em">Critical</span>
            </div>
            <h4 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2);color:#fff">Japanese Knotweed Cluster</h4>
            <p style="color:rgba(255,255,255,0.5);font-size:0.8125rem;line-height:1.6;margin-bottom:var(--space-4)">142 geo-tagged reports within 8 km radius. Satellite NDVI confirms vegetation anomaly.</p>
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:rgba(255,255,255,0.35)">
              <span>Risk Score: <strong style="color:#ef4444">94/100</strong></span>
              <span>2h ago</span>
            </div>
          </div>

          <div class="card hover-lift reveal" data-delay="100" style="padding:var(--space-6);border-left:3px solid #f59e0b;background:rgba(255,255,255,0.06);backdrop-filter:blur(8px);border-top:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06)">
            <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3)">
              <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#f59e0b"></span>
              <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#f59e0b;text-transform:uppercase;letter-spacing:0.08em">Elevated</span>
            </div>
            <h4 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2);color:#fff">Asian Longhorn Beetle</h4>
            <p style="color:rgba(255,255,255,0.5);font-size:0.8125rem;line-height:1.6;margin-bottom:var(--space-4)">28 citizen reports. AI confidence 87%. Satellite canopy analysis pending.</p>
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:rgba(255,255,255,0.35)">
              <span>Risk Score: <strong style="color:#f59e0b">67/100</strong></span>
              <span>6h ago</span>
            </div>
          </div>

          <div class="card hover-lift reveal" data-delay="200" style="padding:var(--space-6);border-left:3px solid #6dbe4b;background:rgba(255,255,255,0.06);backdrop-filter:blur(8px);border-top:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06)">
            <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3)">
              <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#6dbe4b"></span>
              <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#6dbe4b;text-transform:uppercase;letter-spacing:0.08em">Monitoring</span>
            </div>
            <h4 style="font-weight:var(--fw-bold);margin-bottom:var(--space-2);color:#fff">Giant Hogweed Spread</h4>
            <p style="color:rgba(255,255,255,0.5);font-size:0.8125rem;line-height:1.6;margin-bottom:var(--space-4)">15 reports across 3 counties. Satellite verification in progress.</p>
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:rgba(255,255,255,0.35)">
              <span>Risk Score: <strong style="color:#6dbe4b">42/100</strong></span>
              <span>1d ago</span>
            </div>
          </div>
        </div>

        <div class="text-center reveal" data-delay="300">
          <a href="#/alerts" class="btn btn-lg btn-micro" style="background:rgba(109,190,75,0.15);border:1px solid rgba(109,190,75,0.3);color:#6dbe4b">
            <span class="material-symbols-outlined" style="font-size:1.125rem">explore</span> Explore Alert Map
          </a>
        </div>
      </div>

      <!-- ── Ground mist at pond edge ── -->
      <div class="mist-layer" style="height:100px;animation-duration:20s;animation-delay:3s;background:radial-gradient(ellipse at 50% 100%, rgba(15,50,45,0.6) 0%, transparent 70%);"></div>

      <!-- Meadow transition -->
      <svg style="position:absolute;bottom:-1px;width:100%;z-index:5" preserveAspectRatio="none" viewBox="0 0 1440 120" height="80">
        <path d="M0,120 L0,30 Q120,10 240,35 Q360,60 480,25 Q600,0 720,30 Q840,55 960,20 Q1080,0 1200,35 Q1320,60 1440,25 L1440,120Z" fill="#3a5a28"/>
      </svg>
    </section>

    <!-- ════════════════════════════════════════════
         BIOME 4 : MEADOW / WILDFLOWER FIELD
         ════════════════════════════════════════════ -->
    <section style="position:relative;overflow:hidden;background:linear-gradient(180deg,#3a5a28 0%,#4a6a30 20%,#3d6228 50%,#2e5020 80%,#1e3a16 100%);padding:var(--space-20) 0;color:#fff">

      <!-- ── Tall swaying grass at bottom ── -->
      <svg style="position:absolute;bottom:0;left:0;right:0;z-index:2;opacity:0.3;pointer-events:none" width="100%" height="200" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0,200 L0,140 Q20,80 30,140 Q40,60 50,130 Q60,90 70,140 Q80,50 90,130 Q100,80 110,140 Q120,60 130,130 Q140,90 150,145 Q160,70 170,135 Q180,100 190,145 Q200,55 210,130 Q220,85 230,140 L230,200Z" fill="#2a4a1e"><animate attributeName="d" values="M0,200 L0,140 Q20,80 30,140 Q40,60 50,130 Q60,90 70,140 Q80,50 90,130 Q100,80 110,140 Q120,60 130,130 Q140,90 150,145 Q160,70 170,135 Q180,100 190,145 Q200,55 210,130 Q220,85 230,140 L230,200Z;M0,200 L0,135 Q20,85 30,138 Q40,65 50,128 Q60,85 70,142 Q80,55 90,128 Q100,75 110,138 Q120,65 130,128 Q140,85 150,148 Q160,65 170,138 Q180,95 190,148 Q200,60 210,128 Q220,80 230,138 L230,200Z;M0,200 L0,140 Q20,80 30,140 Q40,60 50,130 Q60,90 70,140 Q80,50 90,130 Q100,80 110,140 Q120,60 130,130 Q140,90 150,145 Q160,70 170,135 Q180,100 190,145 Q200,55 210,130 Q220,85 230,140 L230,200Z" dur="4s" repeatCount="indefinite"/></path>
      </svg>

      <!-- ── Wildflower clusters ── -->
      <svg style="position:absolute;bottom:8%;left:5%;z-index:3;opacity:0.4;pointer-events:none" width="120" height="100" viewBox="0 0 120 100">
        <line x1="20" y1="100" x2="18" y2="50" stroke="#3a6a28" stroke-width="2"/>
        <circle cx="18" cy="45" r="8" fill="#e87ca0" opacity="0.7"/><circle cx="18" cy="45" r="4" fill="#f0b060" opacity="0.8"/>
        <line x1="50" y1="100" x2="52" y2="40" stroke="#3a6a28" stroke-width="2"/>
        <circle cx="52" cy="35" r="10" fill="#c86090" opacity="0.6"/><circle cx="52" cy="35" r="5" fill="#f0c060" opacity="0.7"/>
        <line x1="85" y1="100" x2="83" y2="55" stroke="#3a6a28" stroke-width="2"/>
        <circle cx="83" cy="50" r="7" fill="#e8a040" opacity="0.7"/><circle cx="83" cy="50" r="3" fill="#f0d080" opacity="0.8"/>
        <line x1="105" y1="100" x2="107" y2="45" stroke="#3a6a28" stroke-width="2"/>
        <circle cx="107" cy="40" r="9" fill="#d070b0" opacity="0.6"/><circle cx="107" cy="40" r="4" fill="#f0b060" opacity="0.7"/>
      </svg>
      <svg style="position:absolute;bottom:6%;right:4%;z-index:3;opacity:0.35;pointer-events:none" width="100" height="90" viewBox="0 0 100 90">
        <line x1="15" y1="90" x2="13" y2="40" stroke="#3a6a28" stroke-width="2"/>
        <circle cx="13" cy="35" r="9" fill="#e87ca0" opacity="0.7"/><circle cx="13" cy="35" r="4" fill="#f0c060" opacity="0.8"/>
        <line x1="50" y1="90" x2="48" y2="35" stroke="#3a6a28" stroke-width="2"/>
        <circle cx="48" cy="30" r="8" fill="#f0a040" opacity="0.6"/><circle cx="48" cy="30" r="3.5" fill="#f0d080" opacity="0.7"/>
        <line x1="80" y1="90" x2="82" y2="45" stroke="#3a6a28" stroke-width="2"/>
        <circle cx="82" cy="40" r="10" fill="#d080c0" opacity="0.6"/><circle cx="82" cy="40" r="5" fill="#f0b060" opacity="0.7"/>
      </svg>

      <!-- ── BUTTERFLIES (animated) ── -->
      <svg style="position:absolute;top:12%;left:20%;z-index:4;opacity:0.35;animation:bird-fly 16s ease-in-out infinite" width="50" height="40" viewBox="0 0 50 40">
        <ellipse cx="15" cy="14" rx="12" ry="10" fill="#e8a040" opacity="0.7"><animate attributeName="ry" values="10;4;10" dur="0.5s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="35" cy="14" rx="12" ry="10" fill="#e8a040" opacity="0.7"><animate attributeName="ry" values="10;4;10" dur="0.5s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="15" cy="26" rx="8" ry="7" fill="#d08030" opacity="0.5"><animate attributeName="ry" values="7;3;7" dur="0.5s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="35" cy="26" rx="8" ry="7" fill="#d08030" opacity="0.5"><animate attributeName="ry" values="7;3;7" dur="0.5s" repeatCount="indefinite"/></ellipse>
        <line x1="25" y1="8" x2="25" y2="32" stroke="#5a3a1a" stroke-width="1.5"/>
      </svg>
      <svg style="position:absolute;top:8%;right:25%;z-index:4;opacity:0.3;animation:bird-fly 20s ease-in-out 3s infinite" width="40" height="32" viewBox="0 0 50 40">
        <ellipse cx="15" cy="14" rx="12" ry="10" fill="#c060a0" opacity="0.6"><animate attributeName="ry" values="10;4;10" dur="0.6s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="35" cy="14" rx="12" ry="10" fill="#c060a0" opacity="0.6"><animate attributeName="ry" values="10;4;10" dur="0.6s" repeatCount="indefinite"/></ellipse>
        <line x1="25" y1="8" x2="25" y2="32" stroke="#5a3a1a" stroke-width="1.5"/>
      </svg>
      <svg style="position:absolute;top:20%;left:60%;z-index:4;opacity:0.25;animation:bird-fly 24s ease-in-out 6s infinite" width="35" height="28" viewBox="0 0 50 40">
        <ellipse cx="15" cy="14" rx="12" ry="10" fill="#80c0e0" opacity="0.5"><animate attributeName="ry" values="10;4;10" dur="0.45s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="35" cy="14" rx="12" ry="10" fill="#80c0e0" opacity="0.5"><animate attributeName="ry" values="10;4;10" dur="0.45s" repeatCount="indefinite"/></ellipse>
        <line x1="25" y1="8" x2="25" y2="32" stroke="#3a5a6a" stroke-width="1"/>
      </svg>

      <!-- ── Floating pollen / dandelion seeds (JS-spawned) ── -->
      <div id="pollen-particles" style="position:absolute;inset:0;pointer-events:none;z-index:3"></div>

      <!-- ── Sunbeams through canopy ── -->
      <div style="position:absolute;top:0;left:20%;width:200px;height:100%;background:linear-gradient(180deg,rgba(255,240,150,0.06),transparent 50%);transform:skewX(-8deg);pointer-events:none;z-index:1"></div>
      <div style="position:absolute;top:0;left:55%;width:150px;height:100%;background:linear-gradient(180deg,rgba(255,240,150,0.04),transparent 40%);transform:skewX(6deg);pointer-events:none;z-index:1"></div>

      <!-- Content: Live Risk Map + Contribute -->
      <div class="container" style="position:relative;z-index:10">
        <!-- Risk Map -->
        <div class="section-header reveal" style="margin-bottom:var(--space-12)">
          <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#6dbe4b;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-3);display:inline-block">Geospatial Analysis</span>
          <h2 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:var(--fw-bold);text-align:center;color:#fff;margin-bottom:var(--space-3)">Live Invasive Risk Map</h2>
          <p style="text-align:center;color:rgba(255,255,255,0.5);max-width:36rem;margin:0 auto;font-size:0.9375rem;line-height:1.7">Visualize report clusters, vegetation anomalies, and outbreak confidence levels across regions.</p>
          <div style="width:3rem;height:2px;background:#6dbe4b;margin:var(--space-4) auto 0;border-radius:2px"></div>
        </div>

        <div class="reveal" data-delay="100" style="position:relative;border-radius:var(--radius-lg);overflow:hidden;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);min-height:22rem;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);margin-bottom:var(--space-10)">
          <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(109,190,75,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(109,190,75,0.04) 1px,transparent 1px);background-size:30px 30px"></div>
          <div class="map-dot critical" style="top:30%;left:25%"></div>
          <div class="map-dot elevated" style="top:45%;left:60%"></div>
          <div class="map-dot monitoring" style="top:55%;left:35%"></div>
          <div class="map-dot critical" style="top:25%;right:30%"></div>
          <div class="map-dot monitoring" style="top:65%;right:20%"></div>
          <div style="text-align:center;position:relative;z-index:2">
            <span class="material-symbols-outlined" style="font-size:4rem;color:rgba(109,190,75,0.25);margin-bottom:var(--space-4);display:block">public</span>
            <p style="color:rgba(255,255,255,0.4);font-size:0.875rem;margin-bottom:var(--space-4)">Interactive risk map visualization</p>
            <a href="#/alerts" class="btn btn-sm" style="background:rgba(109,190,75,0.15);border:1px solid rgba(109,190,75,0.3);color:#6dbe4b">Launch Full Map</a>
          </div>
        </div>

        <div class="reveal" data-delay="200" style="display:flex;justify-content:center;gap:var(--space-8);margin-bottom:var(--space-6);font-size:0.75rem;color:rgba(255,255,255,0.4)">
          <span style="display:flex;align-items:center;gap:var(--space-2)"><span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#ef4444"></span> Critical (90+)</span>
          <span style="display:flex;align-items:center;gap:var(--space-2)"><span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#f59e0b"></span> Elevated (50-89)</span>
          <span style="display:flex;align-items:center;gap:var(--space-2)"><span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#6dbe4b"></span> Monitoring (<50)</span>
        </div>
      </div>
    </section>

    <!-- ════════════════════════════════════════════
         BIOME 5 : NIGHT FOREST / UNDERGROWTH
         ════════════════════════════════════════════ -->
    <section style="position:relative;overflow:hidden;background:linear-gradient(180deg,#1e3a16 0%,#152e12 30%,#10240e 60%,#0a1a08 100%);padding:var(--space-20) 0;color:#fff">

      <!-- Invasive Mikania micrantha (mile-a-minute) vine overlay on this section -->
      <svg style="position:absolute;top:0;left:0;right:0;pointer-events:none;z-index:2;opacity:0.18" width="100%" height="200" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0,30 Q120,0 240,20 Q360,40 480,10 Q600,30 720,5 Q840,25 960,8 Q1080,30 1200,12 Q1320,35 1440,15" fill="none" stroke="#2a5a1a" stroke-width="4" style="animation:hyacinth-sway 7s ease-in-out infinite"/>
        <path d="M0,60 Q100,40 200,55 Q300,70 400,45 Q500,65 600,40 Q700,60 800,38 Q900,58 1000,40 Q1100,62 1200,42 Q1320,62 1440,44" fill="none" stroke="#1e4a14" stroke-width="3" style="animation:hyacinth-sway 9s ease-in-out 1s infinite reverse"/>
        <!-- Leaf clusters along the vine -->
        <circle cx="240" cy="20" r="8" fill="#2a6a18" opacity="0.6"/>
        <circle cx="480" cy="10" r="6" fill="#3a7a28" opacity="0.5"/>
        <circle cx="720" cy="5" r="7" fill="#2a6a18" opacity="0.6"/>
        <circle cx="960" cy="8" r="5" fill="#3a7a28" opacity="0.5"/>
        <circle cx="1200" cy="12" r="7" fill="#2a6a18" opacity="0.6"/>
      </svg>

      <!-- Ground mist in the undergrowth -->
      <div class="mist-layer" style="height:140px;animation-duration:25s;opacity:0.5;background:radial-gradient(ellipse at 50% 100%, rgba(10,30,10,0.7) 0%, transparent 70%);"></div>

      <!-- ── Moonlight rays ── -->
      <div style="position:absolute;top:0;left:22%;width:180px;height:100%;background:linear-gradient(180deg,rgba(200,220,180,0.05),transparent 50%);transform:skewX(-5deg);pointer-events:none;z-index:1"></div>
      <div style="position:absolute;top:0;left:55%;width:120px;height:100%;background:linear-gradient(180deg,rgba(200,220,180,0.03),transparent 40%);transform:skewX(7deg);pointer-events:none;z-index:1"></div>

      <!-- ── Firefly / spore particles (JS-spawned) ── -->
      <div id="deepsea-particles" style="position:absolute;inset:0;pointer-events:none;z-index:2"></div>

      <!-- ── GLOWING MUSHROOMS ── -->
      <svg style="position:absolute;bottom:12%;right:8%;z-index:3;opacity:0.25;pointer-events:none" width="120" height="100" viewBox="0 0 120 100">
        <rect x="22" y="55" width="6" height="30" rx="3" fill="#c8b898"/>
        <ellipse cx="25" cy="55" rx="20" ry="14" fill="#d4a843" opacity="0.6"><animate attributeName="opacity" values="0.6;0.8;0.6" dur="3s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="25" cy="55" rx="14" ry="9" fill="#e8c860" opacity="0.3"/>
        <rect x="72" y="60" width="5" height="25" rx="2.5" fill="#c8b898"/>
        <ellipse cx="75" cy="60" rx="16" ry="11" fill="#d4a843" opacity="0.5"><animate attributeName="opacity" values="0.5;0.7;0.5" dur="4s" begin="1s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="75" cy="60" rx="10" ry="7" fill="#e8c860" opacity="0.25"/>
        <rect x="100" y="65" width="4" height="20" rx="2" fill="#c8b898"/>
        <ellipse cx="102" cy="65" rx="12" ry="8" fill="#d4a843" opacity="0.4"><animate attributeName="opacity" values="0.4;0.65;0.4" dur="3.5s" begin="0.5s" repeatCount="indefinite"/></ellipse>
      </svg>
      <svg style="position:absolute;bottom:10%;left:5%;z-index:3;opacity:0.2;pointer-events:none" width="80" height="70" viewBox="0 0 80 70">
        <rect x="18" y="40" width="5" height="22" rx="2.5" fill="#c8b898"/>
        <ellipse cx="20" cy="40" rx="16" ry="11" fill="#b8903a" opacity="0.5"><animate attributeName="opacity" values="0.5;0.75;0.5" dur="3.2s" repeatCount="indefinite"/></ellipse>
        <rect x="52" y="45" width="4" height="18" rx="2" fill="#c8b898"/>
        <ellipse cx="54" cy="45" rx="12" ry="8" fill="#d4a843" opacity="0.4"><animate attributeName="opacity" values="0.4;0.6;0.4" dur="4s" begin="1.5s" repeatCount="indefinite"/></ellipse>
      </svg>

      <!-- ── DEER silhouette ── -->
      <svg style="position:absolute;bottom:18%;left:12%;z-index:2;opacity:0.1;pointer-events:none" width="100" height="120" viewBox="0 0 100 120">
        <path d="M40,120 L40,75 Q38,65 42,55 L42,45 Q35,40 30,30 L25,15 M42,45 Q48,40 55,30 L60,15" fill="none" stroke="#4a7a3a" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="42" cy="75" rx="14" ry="22" fill="#2a4a1e"/>
        <ellipse cx="42" cy="48" rx="6" ry="8" fill="#2a4a1e"/>
        <circle cx="45" cy="46" r="1.5" fill="#6a9a5a"/>
        <line x1="35" y1="120" x2="30" y2="100" stroke="#2a4a1e" stroke-width="3" stroke-linecap="round"/>
        <line x1="48" y1="120" x2="52" y2="100" stroke="#2a4a1e" stroke-width="3" stroke-linecap="round"/>
      </svg>

      <!-- ── MOTHS (animated) ── -->
      <svg style="position:absolute;top:15%;right:20%;z-index:4;opacity:0.2;animation:bird-fly 18s ease-in-out infinite" width="35" height="28" viewBox="0 0 50 40">
        <ellipse cx="15" cy="18" rx="10" ry="8" fill="#c8b898" opacity="0.5"><animate attributeName="ry" values="8;3;8" dur="0.3s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="35" cy="18" rx="10" ry="8" fill="#c8b898" opacity="0.5"><animate attributeName="ry" values="8;3;8" dur="0.3s" repeatCount="indefinite"/></ellipse>
        <line x1="25" y1="12" x2="25" y2="28" stroke="#8a7a5a" stroke-width="1"/>
      </svg>
      <svg style="position:absolute;top:25%;left:30%;z-index:4;opacity:0.15;animation:bird-fly 22s ease-in-out 4s infinite" width="28" height="22" viewBox="0 0 50 40">
        <ellipse cx="15" cy="18" rx="10" ry="8" fill="#a8a070" opacity="0.4"><animate attributeName="ry" values="8;3;8" dur="0.35s" repeatCount="indefinite"/></ellipse>
        <ellipse cx="35" cy="18" rx="10" ry="8" fill="#a8a070" opacity="0.4"><animate attributeName="ry" values="8;3;8" dur="0.35s" repeatCount="indefinite"/></ellipse>
        <line x1="25" y1="12" x2="25" y2="28" stroke="#7a6a4a" stroke-width="1"/>
      </svg>

      <!-- ── FERN clusters ── -->
      <svg style="position:absolute;bottom:0;left:3%;z-index:3;opacity:0.2;pointer-events:none" width="120" height="150" viewBox="0 0 120 150">
        <path d="M60,150 Q55,120 40,100 Q25,90 15,70" fill="none" stroke="#2a5a1e" stroke-width="2.5" stroke-linecap="round"><animate attributeName="d" values="M60,150 Q55,120 40,100 Q25,90 15,70;M60,150 Q58,120 42,100 Q28,90 18,70;M60,150 Q55,120 40,100 Q25,90 15,70" dur="5s" repeatCount="indefinite"/></path>
        <path d="M60,150 Q65,115 80,95 Q95,85 105,65" fill="none" stroke="#2a5a1e" stroke-width="2.5" stroke-linecap="round"><animate attributeName="d" values="M60,150 Q65,115 80,95 Q95,85 105,65;M60,150 Q62,115 78,95 Q92,85 102,65;M60,150 Q65,115 80,95 Q95,85 105,65" dur="5.5s" repeatCount="indefinite"/></path>
        <path d="M60,150 Q58,110 60,80 Q62,50 60,25" fill="none" stroke="#3a6a2a" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <svg style="position:absolute;bottom:0;right:5%;z-index:3;opacity:0.15;pointer-events:none" width="100" height="130" viewBox="0 0 100 130">
        <path d="M50,130 Q45,100 30,80 Q18,70 10,50" fill="none" stroke="#2a5a1e" stroke-width="2" stroke-linecap="round"><animate attributeName="d" values="M50,130 Q45,100 30,80 Q18,70 10,50;M50,130 Q48,100 33,80 Q20,70 13,50;M50,130 Q45,100 30,80 Q18,70 10,50" dur="4.5s" repeatCount="indefinite"/></path>
        <path d="M50,130 Q55,95 70,75 Q82,65 90,45" fill="none" stroke="#2a5a1e" stroke-width="2" stroke-linecap="round"/>
      </svg>

      <!-- ── Tree root network at bottom ── -->
      <svg style="position:absolute;bottom:0;left:0;right:0;z-index:2;opacity:0.12;pointer-events:none" width="100%" height="80" viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0,80 Q50,60 100,70 Q200,40 300,65 Q400,30 500,55 Q600,45 720,60 Q840,35 960,55 Q1080,40 1200,65 Q1300,50 1440,80Z" fill="#1a2a10"/>
      </svg>

      <!-- Content: Contribute + Expert + Stats -->
      <div class="container" style="position:relative;z-index:10">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-16);align-items:center;margin-bottom:var(--space-20)">
          <div class="reveal">
            <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:#6dbe4b;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-4);display:block">Contribute</span>
            <h2 style="font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:var(--fw-bold);color:#fff;margin-bottom:var(--space-4);line-height:1.3">Become Part of the Early Warning Network</h2>
            <p style="color:rgba(255,255,255,0.55);line-height:1.8;margin-bottom:var(--space-8)">Every verified report strengthens ecological defense and enables faster containment of invasive species.</p>
            <a href="#/report" class="btn btn-primary btn-lg btn-micro">
              <span class="material-symbols-outlined" style="font-size:1.125rem">add_a_photo</span> Submit a Report
            </a>
          </div>

          <div class="reveal" data-delay="200">
            <div style="padding:var(--space-8);background:rgba(255,255,255,0.04);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08);border-radius:var(--radius-xl)">
              <span style="font-size:0.65rem;font-weight:var(--fw-bold);color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:var(--space-6);display:block">Request Expert Validation</span>
              <h3 style="font-weight:var(--fw-bold);margin-bottom:var(--space-3);font-size:1.25rem;color:#fff">Unsure about a species?</h3>
              <p style="color:rgba(255,255,255,0.5);font-size:0.875rem;line-height:1.7;margin-bottom:var(--space-6)">Submit your observation for expert review and containment recommendations.</p>
              <a href="#/about" class="btn btn-lg btn-micro" style="border:1px solid rgba(109,190,75,0.3);color:#6dbe4b;background:rgba(109,190,75,0.08);width:100%;justify-content:center">
                <span class="material-symbols-outlined" style="font-size:1.125rem">science</span> Contact an Expert
              </a>
            </div>
          </div>
        </div>

        <!-- Stats bar -->
        <div class="reveal" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:var(--radius-xl);padding:var(--space-10) var(--space-8)">
          <div class="four-col-grid" style="text-align:center">
            <div>
              <span class="stat-number" data-count="12847" style="color:#6dbe4b">0</span>
              <p class="stat-label" style="color:rgba(255,255,255,0.4)">Reports Analyzed</p>
            </div>
            <div>
              <span class="stat-number" data-count="94" data-suffix="%" style="color:#6dbe4b">0</span>
              <p class="stat-label" style="color:rgba(255,255,255,0.4)">AI Accuracy</p>
            </div>
            <div>
              <span class="stat-number" data-count="23" style="color:#6dbe4b">0</span>
              <p class="stat-label" style="color:rgba(255,255,255,0.4)">Active Alerts</p>
            </div>
            <div>
              <span class="stat-number" data-count="6" data-suffix="–12 mo" style="color:#6dbe4b">0</span>
              <p class="stat-label" style="color:rgba(255,255,255,0.4)">Earlier Detection</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  ${renderFooter()}`,
    init() {
      const hero = document.getElementById('hero-section');
      if (!hero) return;

      // Parallax layers
      const layers = [
        { el: document.getElementById('layer-sun'), speed: 0.005 },
        { el: document.getElementById('layer-mountains'), speed: 0.008 },
        { el: document.getElementById('layer-valley'), speed: 0.015 },
        { el: document.getElementById('layer-forest'), speed: 0.025 },
        { el: document.getElementById('hero-content-wrap'), speed: -0.01 },
      ];

      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;
        layers.forEach(({ el, speed }) => {
          if (!el) return;
          el.style.transform = 'translate(' + (cx * speed * 100) + 'px,' + (cy * speed * 60) + 'px)';
        });
      });

      hero.addEventListener('mouseleave', () => {
        layers.forEach(({ el }) => {
          if (!el) return;
          el.style.transition = 'transform 0.6s ease';
          el.style.transform = 'translate(0,0)';
          setTimeout(() => { el.style.transition = ''; }, 600);
        });
      });

      // Hero floating particles
      const container = document.getElementById('hero-particles');
      if (container) {
        const symbols = ['🍃', '🌿', '•', '✦', '🌱'];
        for (let i = 0; i < 18; i++) {
          const p = document.createElement('span');
          p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
          p.style.cssText = 'position:absolute;font-size:' + (10 + Math.random() * 14) + 'px;opacity:' + (0.15 + Math.random() * 0.15) + ';animation:particle-float ' + (6 + Math.random() * 6) + 's ease-in-out ' + (Math.random() * 4) + 's infinite;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 70) + '%;pointer-events:none';
          container.appendChild(p);
        }
      }

      // Forest firefly particles (big + glowing)
      const forestP = document.getElementById('forest-particles');
      if (forestP) {
        for (let i = 0; i < 35; i++) {
          const dot = document.createElement('span');
          const size = 4 + Math.random() * 4;
          dot.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:rgba(180,230,120,${0.3 + Math.random() * 0.3});box-shadow:0 0 ${size * 2}px rgba(180,230,120,0.3);left:${Math.random() * 100}%;top:${Math.random() * 100}%;pointer-events:none;animation:firefly ${4 + Math.random() * 6}s ease-in-out ${Math.random() * 5}s infinite`;
          forestP.appendChild(dot);
        }
      }

      // Falling leaves in forest
      const leavesC = document.getElementById('falling-leaves');
      if (leavesC) {
        const leafEmojis = ['🍂', '🍃', '🌿', '🍁'];
        for (let i = 0; i < 15; i++) {
          const leaf = document.createElement('span');
          leaf.textContent = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];
          const dur = 8 + Math.random() * 10;
          const delay = Math.random() * 12;
          const left = Math.random() * 100;
          leaf.style.cssText = `position:absolute;font-size:${14 + Math.random() * 12}px;left:${left}%;top:-5%;opacity:0.25;pointer-events:none;animation:leaf-fall ${dur}s linear ${delay}s infinite`;
          leavesC.appendChild(leaf);
        }
      }

      // Floating pollen / dandelion seeds (meadow)
      const pollenP = document.getElementById('pollen-particles');
      if (pollenP) {
        for (let i = 0; i < 30; i++) {
          const p = document.createElement('span');
          const size = 3 + Math.random() * 4;
          p.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:rgba(240,220,120,${0.2 + Math.random() * 0.3});box-shadow:0 0 ${size * 2}px rgba(240,220,120,0.15);left:${Math.random() * 100}%;top:${Math.random() * 100}%;pointer-events:none;animation:particle-float ${5 + Math.random() * 8}s ease-in-out ${Math.random() * 6}s infinite`;
          pollenP.appendChild(p);
        }
      }

      // Night forest spore particles (warm green/amber glow)
      const deepP = document.getElementById('deepsea-particles');
      if (deepP) {
        for (let i = 0; i < 40; i++) {
          const dot = document.createElement('span');
          const size = 3 + Math.random() * 4;
          const hue = 60 + Math.random() * 60;
          dot.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:hsla(${hue},70%,55%,${0.12 + Math.random() * 0.18});box-shadow:0 0 ${size * 3}px hsla(${hue},70%,55%,0.2);left:${Math.random() * 100}%;top:${Math.random() * 100}%;pointer-events:none;animation:firefly ${3 + Math.random() * 5}s ease-in-out ${Math.random() * 4}s infinite`;
          deepP.appendChild(dot);
        }
      }

      // ── Hero rain drops (JS-spawned) ──
      const rainC = document.getElementById('hero-rain');
      if (rainC) {
        for (let i = 0; i < 60; i++) {
          const drop = document.createElement('div');
          const dur = (0.8 + Math.random() * 0.9).toFixed(2);
          const delay = (Math.random() * 4).toFixed(2);
          const left = (Math.random() * 100).toFixed(1);
          const h = (14 + Math.random() * 12).toFixed(0);
          drop.className = 'rain-drop';
          drop.style.cssText = `left:${left}%;top:${(Math.random() * 30).toFixed(0)}%;height:${h}px;--dur:${dur}s;--delay:${delay}s;opacity:${0.25 + Math.random() * 0.3};transform:rotate(${8 + Math.random() * 6}deg)`;
          rainC.appendChild(drop);
        }
      }

      // ── Invasive spore bursts in forest biome ──
      const sporeC = document.getElementById('spore-particles');
      if (sporeC) {
        for (let i = 0; i < 18; i++) {
          const s = document.createElement('div');
          const size = 3 + Math.random() * 5;
          const dx = ((Math.random() - 0.5) * 80).toFixed(0);
          const dy = -(30 + Math.random() * 50);
          s.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:rgba(239,106,32,${0.3 + Math.random() * 0.3});left:${20 + Math.random() * 60}%;bottom:${5 + Math.random() * 15}%;pointer-events:none;--dx:${dx}px;--dy:${dy}px;animation:spore-burst ${3 + Math.random() * 4}s ease-out ${Math.random() * 6}s infinite`;
          sporeC.appendChild(s);
        }
      }

      // ── Rain-impact ripples on pond surface ──
      const rippleC = document.getElementById('rain-ripples');
      if (rippleC) {
        const spawnRipple = () => {
          const r = document.createElement('div');
          const w = 12 + Math.random() * 20;
          r.style.cssText = `position:absolute;width:${w}px;height:${w * 0.35}px;border-radius:50%;border:1px solid rgba(100,200,170,0.5);left:${Math.random() * 100}%;top:${Math.random() * 80}%;animation:rain-ripple ${0.8 + Math.random() * 0.6}s ease-out forwards;pointer-events:none`;
          rippleC.appendChild(r);
          setTimeout(() => r.remove(), 1400);
        };
        // Fire initial burst then steady rate
        for (let i = 0; i < 5; i++) setTimeout(spawnRipple, i * 200);
        const rippleTimer = setInterval(spawnRipple, 350);
        // Store for cleanup
        rippleC.dataset.timer = rippleTimer;
      }
    },

    cleanup() {
      // cleanup handled by router
    }
  };
}
