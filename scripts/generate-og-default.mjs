#!/usr/bin/env node
/**
 * Generate public/og/default.png — 1200x630 Open Graph fallback image.
 *
 * Composition follows DESIGN.md ("B3 · Terminal"):
 *   - Near-black base `--bg-0` with the barely-there violet ambient at the top.
 *   - One terminal pane (`--bg-1`, `--border`) with its `~/inicio` bar.
 *   - Prompt + the home hero headline in Space Mono 700, body in IBM Plex Mono.
 *
 * Crop safety: WhatsApp and most chat apps crop the centre of the card for
 * their thumbnails, down to a square in the narrowest case. Every piece of
 * text therefore lives inside SAFE_ZONE (the centred 630x630 square); only
 * the pane frame and background reach the edges.
 *
 * Fonts: rendered with resvg from the site's own self-hosted woff2 files
 * (decompressed to a temp dir), never from system fonts, so the output is the
 * same on every machine.
 *
 * Run with `node scripts/generate-og-default.mjs`.
 * Re-run whenever the hero copy or the palette changes.
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import wawoff2 from 'wawoff2';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** Centred square kept by the narrowest chat-app crop. */
export const SAFE_ZONE = {
  x: (OG_WIDTH - OG_HEIGHT) / 2,
  y: 0,
  width: OG_HEIGHT,
  height: OG_HEIGHT,
};

const FONT_DIRS = ['space-mono', 'ibm-plex-mono'];
// Only the `latin` subset (covers Spanish: á, ñ, ¿...). resvg picks one face
// per family and weight with no per-glyph fallback, so loading `latin-ext`
// too can select a face without basic letters and render .notdef boxes.
const LATIN_SUBSET = /-latin-\d+-normal\.woff2$/;
const fontsRoot = fileURLToPath(new URL('../public/fonts/', import.meta.url));
const outPath = fileURLToPath(new URL('../public/og/default.png', import.meta.url));

// DESIGN.md tokens.
const color = {
  bg0: '#08070b',
  bg1: '#0c0b11',
  bgInset: '#0a090e',
  text0: '#e9e6f2',
  text1: '#c9c5d6',
  text2: '#9b97a8',
  border: '#24222e',
  accent: '#a78bfa',
};

const display = `font-family="Space Mono" font-weight="700"`;
const mono = `font-family="IBM Plex Mono" font-weight="400"`;

// Content column: left-aligned text, centred as a block inside SAFE_ZONE.
const COLUMN_X = SAFE_ZONE.x + 24;
const COLUMN_RIGHT = SAFE_ZONE.x + SAFE_ZONE.width - 24;
// IBM Plex Mono advance width is 600/1000 em.
const PROMPT_SIZE = 22;
const PROMPT = 'marcos@marmibas:~$ ';
const cursorX = COLUMN_X + PROMPT.length * PROMPT_SIZE * 0.6;

function prompt(y, command = '') {
  return `<text x="${COLUMN_X}" y="${y}" ${mono} font-size="${PROMPT_SIZE}" xml:space="preserve"><tspan fill="${color.accent}">marcos@marmibas</tspan><tspan fill="${color.text2}">:~$ </tspan><tspan fill="${color.text1}">${command}</tspan></text>`;
}

function content() {
  return `
  <circle cx="${COLUMN_X + 5}" cy="62" r="5" fill="${color.accent}"/>
  <text x="${COLUMN_X + 20}" y="67" ${mono} font-size="15" fill="${color.text2}">~/inicio</text>
  <text x="${COLUMN_RIGHT}" y="67" ${mono} font-size="15" fill="${color.text2}"
        text-anchor="end">marmibas.dev</text>

  ${prompt(190, 'whoami')}

  <g ${display} font-size="50" fill="${color.text0}">
    <text x="${COLUMN_X}" y="272">Software a medida</text>
    <text x="${COLUMN_X}" y="334">para negocios</text>
    <text x="${COLUMN_X}" y="396">que quieren <tspan fill="${color.accent}">crecer.</tspan></text>
  </g>

  <text x="${COLUMN_X}" y="452" ${mono} font-size="${PROMPT_SIZE}" fill="${color.text2}">Webs, apps y sistemas internos.</text>

  ${prompt(524)}
  <rect x="${cursorX}" y="505" width="12" height="24" fill="${color.accent}"/>`;
}

function frame() {
  return `
  <defs>
    <radialGradient id="ambient" cx="50%" cy="0%" r="70%" fx="50%" fy="0%">
      <stop offset="0%" stop-color="${color.accent}" stop-opacity="0.12"/>
      <stop offset="60%" stop-color="${color.accent}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="pane">
      <rect x="48" y="40" width="1104" height="550" rx="20"/>
    </clipPath>
  </defs>

  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${color.bg0}"/>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#ambient)"/>

  <g clip-path="url(#pane)">
    <rect x="48" y="40" width="1104" height="550" fill="${color.bg1}"/>
    <rect x="48" y="40" width="1104" height="44" fill="${color.bgInset}"/>
    <line x1="48" y1="84.5" x2="1152" y2="84.5" stroke="${color.border}"/>
  </g>
  <rect x="48.5" y="40.5" width="1103" height="549" rx="20"
        fill="none" stroke="${color.border}"/>
`;
}

/**
 * Build the card as SVG. `contentOnly` drops the background and pane so a
 * bounding box measures just the text that has to survive the crop.
 */
export function buildOgSvg({ contentOnly = false } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">${
    contentOnly ? '' : frame()
  }${content()}
</svg>`;
}

/**
 * Decompress the self-hosted woff2 files into a temp dir of TTFs: resvg reads
 * neither woff2 nor (in 2.6) in-memory font buffers.
 */
async function withSiteFonts(render) {
  const dir = mkdtempSync(join(tmpdir(), 'og-fonts-'));
  try {
    const fontFiles = [];
    // Sequential on purpose: wawoff2 returns a view into its shared WASM heap,
    // so a concurrent decompress overwrites the bytes of the previous one.
    for (const family of FONT_DIRS) {
      for (const name of readdirSync(resolve(fontsRoot, family))) {
        if (!LATIN_SUBSET.test(name)) continue;
        const ttf = await wawoff2.decompress(readFileSync(resolve(fontsRoot, family, name)));
        const path = join(dir, name.replace(/\.woff2$/, '.ttf'));
        writeFileSync(path, ttf);
        fontFiles.push(path);
      }
    }
    return render(fontFiles);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export async function renderSvg(svg) {
  return withSiteFonts((fontFiles) => {
    const resvg = new Resvg(svg, {
      font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'IBM Plex Mono' },
    });
    return { png: resvg.render().asPng(), bbox: resvg.getBBox() };
  });
}

export async function renderOgImage({ contentOnly = false } = {}) {
  return renderSvg(buildOgSvg({ contentOnly }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { png } = await renderOgImage();
  writeFileSync(outPath, png);
  console.log(`Wrote ${outPath} (${(png.byteLength / 1024).toFixed(1)} KB)`);
}
