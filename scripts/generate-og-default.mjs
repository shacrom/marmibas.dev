#!/usr/bin/env node
/**
 * Generate public/og/default.png — 1200x630 Open Graph fallback image.
 *
 * Composition follows DESIGN.md:
 *   - Base bg `#0a0a0f` (--bg-0).
 *   - Radial violet ambient at the top (--gradient-hero-ambient).
 *   - Wordmark "marmibas.dev" in serif display + tagline in sans.
 *   - Subtle border in --border tone.
 *
 * Source: T-51. Run with `node scripts/generate-og-default.mjs`.
 * Re-run whenever the wordmark or tagline changes.
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../public/og');
const outPath = resolve(outDir, 'default.png');
mkdirSync(outDir, { recursive: true });

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="ambient" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="#6d28d9" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="#6d28d9" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#0a0a0f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="title" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fafafa"/>
      <stop offset="100%" stop-color="#c4b5fd"/>
    </linearGradient>
    <linearGradient id="dot" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#c4b5fd"/>
    </linearGradient>
  </defs>

  <!-- Base + ambient -->
  <rect width="1200" height="630" fill="#0a0a0f"/>
  <rect width="1200" height="630" fill="url(#ambient)"/>

  <!-- Inner border -->
  <rect x="32" y="32" width="1136" height="566" rx="20" ry="20"
        fill="none" stroke="#252535" stroke-width="1.5"/>

  <!-- Top-left brand dot + url chip -->
  <g transform="translate(80, 96)">
    <circle cx="10" cy="10" r="10" fill="url(#dot)"/>
    <text x="34" y="17" fill="#a8a8b8"
          font-family="'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
          font-size="22" letter-spacing="0.04em">marmibas.dev</text>
  </g>

  <!-- Display title -->
  <text x="80" y="340" fill="url(#title)"
        font-family="'Fraunces', 'Iowan Old Style', 'Apple Garamond', Georgia, 'Times New Roman', serif"
        font-size="128" font-weight="600" letter-spacing="-0.02em">
    Software para
  </text>
  <text x="80" y="470" fill="url(#title)"
        font-family="'Fraunces', 'Iowan Old Style', 'Apple Garamond', Georgia, 'Times New Roman', serif"
        font-size="128" font-weight="600" letter-spacing="-0.02em">
    tu negocio.
  </text>

  <!-- Tagline -->
  <text x="80" y="540" fill="#a8a8b8"
        font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
        font-size="30" font-weight="400">
    Full stack engineer — Astro, TypeScript, Node, cloud.
  </text>

  <!-- Bottom-right status pill -->
  <g transform="translate(940, 540)">
    <rect x="0" y="0" width="180" height="36" rx="18" ry="18"
          fill="#12121a" stroke="#252535" stroke-width="1"/>
    <circle cx="20" cy="18" r="5" fill="#a78bfa"/>
    <text x="36" y="24" fill="#e8e8ee"
          font-family="'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
          font-size="16" font-weight="500">en producción</text>
  </g>
</svg>`;

// Persist the source SVG too — handy fallback for platforms that accept SVG.
writeFileSync(resolve(outDir, 'default.svg'), svg);

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, palette: false })
  .toFile(outPath);

const { size } = await sharp(outPath).metadata();
console.log(`Wrote ${outPath}`);
console.log(`Wrote ${resolve(outDir, 'default.svg')}`);
console.log(`PNG size: ${size ?? 'n/a'}`);
