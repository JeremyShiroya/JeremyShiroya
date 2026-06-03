/**
 * make-works.mjs
 * Generates project showcase cards for the JeremyShiroya profile README.
 * Run: node make-works.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'works');
fs.mkdirSync(OUT, { recursive: true });

const W = 1280, H = 420;

// ── Project definitions ───────────────────────────────────────────────────────
const PROJECTS = [
  {
    file:   'bookish.png',
    name:   'Bookish',
    desc1:  'Personal digital library &',
    desc2:  'audiobook player.',
    stack:  'Nuxt 4  ·  Vue 3  ·  Drizzle ORM  ·  Neon',
    g1: '#12022E', g2: '#6D28D9',
    type: 'fan',
    images: [
      'C:/Users/jerem/GitHub/Bookish/public/Images/Red Rising.jpg',
      'C:/Users/jerem/GitHub/Bookish/public/Images/1984.jpg',
      'C:/Users/jerem/GitHub/Bookish/public/Images/Brave New World.jpg',
    ],
  },
  {
    file:   'najibudget.png',
    name:   'Najibudget',
    desc1:  'Smart budget tracker &',
    desc2:  'spending insights.',
    stack:  'Nuxt 4  ·  Capacitor  ·  SQLite  ·  Vue 3',
    g1: '#031A0D', g2: '#15803D',
    type: 'logo',
    images: ['C:/Users/jerem/GitHub/Najibudget/public/Logo.png'],
  },
  {
    file:   'palasi.png',
    name:   'Palasi',
    desc1:  'Luxury furniture e-commerce',
    desc2:  'with full admin dashboard.',
    stack:  'Nuxt 3  ·  Turso  ·  Nuxt UI  ·  Vue 3',
    g1: '#1C1410', g2: '#92400E',
    type: 'fan',
    images: [
      'C:/Users/jerem/GitHub/Palasi/public/Images/Edinburg.webp',
      'C:/Users/jerem/GitHub/Palasi/public/Images/Aero.webp',
      'C:/Users/jerem/GitHub/Palasi/public/Images/Solara.webp',
    ],
  },
  {
    file:   'rewind.png',
    name:   'Rewind',
    desc1:  'Full-stack social media',
    desc2:  'with real-time messaging.',
    stack:  'Nuxt 4  ·  Supabase  ·  Pinia  ·  Vue 3',
    g1: '#060D1F', g2: '#1D4ED8',
    type: 'abstract',
    images: [],
  },
];

// ── Shared helpers ────────────────────────────────────────────────────────────
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const CW = 155, CH = 230;
const ROUND_MASK = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}">
    <rect width="${CW}" height="${CH}" rx="10" ry="10" fill="white"/>
  </svg>`
);

async function loadImage(filePath, w, h, fit = 'cover') {
  if (!fs.existsSync(filePath)) return null;
  return sharp(filePath)
    .resize(w, h, { fit, position: 'centre', background: { r:0,g:0,b:0,alpha:0 } })
    .composite([{ input: Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
        <rect width="${w}" height="${h}" rx="10" ry="10" fill="white"/>
      </svg>`
    ), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function rotateImg(buf, deg) {
  if (deg === 0) return buf;
  return sharp(buf)
    .rotate(deg, { background: { r:0,g:0,b:0,alpha:0 } })
    .png()
    .toBuffer();
}

async function makeShadow(buf) {
  const { width: w, height: h } = await sharp(buf).metadata();
  return sharp({ create: { width: w, height: h, channels: 4, background: { r:0,g:0,b:0,alpha:180 } } })
    .composite([{ input: buf, blend: 'dest-in' }])
    .blur(12)
    .png()
    .toBuffer();
}

// ── Overlay SVG (vignette + text) ─────────────────────────────────────────────
function makeOverlay(proj, uid) {
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${uid}vl" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stop-color="${proj.g1}" stop-opacity="0.78"/>
        <stop offset="46%" stop-color="${proj.g1}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="${uid}vr" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%"  stop-color="${proj.g1}" stop-opacity="0.50"/>
        <stop offset="50%" stop-color="${proj.g1}" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="${uid}gl" cx="78%" cy="28%" r="44%">
        <stop offset="0%"   stop-color="white" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="white" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- Highlights + vignettes -->
    <rect width="${W}" height="${H}" fill="url(#${uid}gl)"/>
    <rect width="${W}" height="${H}" fill="url(#${uid}vl)"/>
    <rect width="${W}" height="${H}" fill="url(#${uid}vr)"/>

    <!-- Project name -->
    <text x="${W * 0.515}" y="${H * 0.38}"
          font-family="'Segoe UI','Arial Black',Arial,sans-serif"
          font-size="66" font-weight="800" fill="white" opacity="0.97">${esc(proj.name)}</text>

    <!-- Description -->
    <text x="${W * 0.515}" y="${H * 0.575}"
          font-family="'Segoe UI',Arial,sans-serif"
          font-size="26" font-weight="400" fill="rgba(255,255,255,0.80)">${esc(proj.desc1)}</text>
    <text x="${W * 0.515}" y="${H * 0.70}"
          font-family="'Segoe UI',Arial,sans-serif"
          font-size="26" font-weight="400" fill="rgba(255,255,255,0.80)">${esc(proj.desc2)}</text>

    <!-- Stack -->
    <text x="${W * 0.515}" y="${H * 0.875}"
          font-family="'Segoe UI',Arial,sans-serif"
          font-size="17" font-weight="400" fill="rgba(255,255,255,0.45)">${esc(proj.stack)}</text>
  </svg>`);
}

// ── Abstract Rewind overlay (social feed shapes) ──────────────────────────────
function makeRewindLeft(uid) {
  const a = (o) => `rgba(255,255,255,${o})`;
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <!-- Stories row -->
    ${[55,110,165,220,275].map((x, i) =>
      `<circle cx="${x}" cy="68" r="34" fill="${a(0.12)}" stroke="${a(i===0?0.7:0.30)}" stroke-width="2.5"/>`
    ).join('')}

    <!-- Post card 1 -->
    <rect x="22" y="124" width="500" height="100" rx="12" fill="${a(0.10)}"/>
    <circle cx="56" cy="149" r="20" fill="${a(0.22)}"/>
    <rect x="86" y="140" width="160" height="10" rx="5" fill="${a(0.25)}"/>
    <rect x="86" y="158" width="110" height="8"  rx="4" fill="${a(0.14)}"/>
    <!-- like / comment icons -->
    <rect x="86" y="195" width="32" height="8" rx="4" fill="${a(0.22)}"/>
    <rect x="130" y="195" width="32" height="8" rx="4" fill="${a(0.16)}"/>

    <!-- Post card 2 -->
    <rect x="22" y="242" width="500" height="100" rx="12" fill="${a(0.08)}"/>
    <circle cx="56" cy="267" r="20" fill="${a(0.18)}"/>
    <rect x="86" y="258" width="200" height="10" rx="5" fill="${a(0.22)}"/>
    <rect x="86" y="276" width="130" height="8"  rx="4" fill="${a(0.12)}"/>
    <rect x="86" y="313" width="32" height="8" rx="4" fill="${a(0.20)}"/>
    <rect x="130" y="313" width="32" height="8" rx="4" fill="${a(0.14)}"/>
  </svg>`);
}

// ── Card builder ──────────────────────────────────────────────────────────────
async function makeCard(proj, idx) {
  const uid = `p${idx}`;

  // 1. Gradient background
  const bgSvg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${uid}bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0%"   stop-color="${proj.g1}"/>
        <stop offset="100%" stop-color="${proj.g2}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${uid}bg)"/>
  </svg>`);
  const base = await sharp(bgSvg).resize(W, H).png().toBuffer();

  const composites = [];

  // 2. Left-side visuals
  if (proj.type === 'fan') {
    // Fan of 3 images with shadow (same as Bookish gallery)
    const slots = [
      { cx: 140, cy: H/2 - 12, rot: -9 },
      { cx: 290, cy: H/2 + 8,  rot:  0 },
      { cx: 440, cy: H/2 - 5,  rot:  7 },
    ];
    for (let i = 0; i < Math.min(proj.images.length, 3); i++) {
      const raw = await loadImage(proj.images[i], CW, CH, 'cover');
      if (!raw) continue;
      const rotated = await rotateImg(raw, slots[i].rot);
      const { width: rw, height: rh } = await sharp(rotated).metadata();
      const left = Math.round(slots[i].cx - rw / 2);
      const top  = Math.round(slots[i].cy - rh / 2);
      composites.push({ input: await makeShadow(rotated), left: left + 4, top: top + 8 });
      composites.push({ input: rotated, left, top });
    }

  } else if (proj.type === 'logo') {
    // Large centred logo with glow halo
    const logoSize = 220;
    const logo = await loadImage(proj.images[0], logoSize, logoSize, 'contain');
    if (logo) {
      // Glow halo
      const halo = Buffer.from(`<svg width="${logoSize+100}" height="${logoSize+100}" xmlns="http://www.w3.org/2000/svg">
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stop-color="${proj.g2}" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="${proj.g2}" stop-opacity="0"/>
        </radialGradient>
        <circle cx="${(logoSize+100)/2}" cy="${(logoSize+100)/2}" r="${(logoSize+100)/2}" fill="url(#halo)"/>
      </svg>`);
      composites.push({ input: halo, left: Math.round(W*0.24 - (logoSize+100)/2), top: Math.round(H/2 - (logoSize+100)/2) });
      composites.push({ input: logo, left: Math.round(W*0.24 - logoSize/2), top: Math.round(H/2 - logoSize/2) });
    }

  } else if (proj.type === 'abstract') {
    // SVG social-feed shapes
    composites.push({ input: makeRewindLeft(uid), left: 0, top: 0 });
  }

  // 3. Overlay: vignette + text
  composites.push({ input: makeOverlay(proj, uid), left: 0, top: 0 });

  // 4. Render
  await sharp(base).composite(composites).png().toFile(path.join(OUT, proj.file));
  console.log(`  ✓  ${proj.file}`);
}

// ── Run ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Generating project cards…\n');
  for (let i = 0; i < PROJECTS.length; i++) await makeCard(PROJECTS[i], i);
  console.log('\nDone — saved to works/');
})().catch(err => { console.error(err); process.exit(1); });
