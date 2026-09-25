#!/usr/bin/env node
/**
 * Generate public/og/default.png — 1200x630 Open Graph fallback image.
 *
 * The card shows only the Marmibas logo (`public/marmibas-logo.png`, white
 * wordmark on transparent) centred on the site background `--bg-0`
 * (DESIGN.md) — owner request: nothing else on the card.
 *
 * Crop safety: WhatsApp and most chat apps crop the centre of the card for
 * their thumbnails, down to a square in the narrowest case, so the logo is
 * sized to fit SAFE_ZONE (the centred 630x630 square) with room to spare.
 *
 * Run with `node scripts/generate-og-default.mjs`.
 * Re-run whenever the logo or the background colour changes.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** Centred square kept by the narrowest chat-app crop. */
export const SAFE_ZONE = {
  x: (OG_WIDTH - OG_HEIGHT) / 2,
  y: 0,
  width: OG_HEIGHT,
  height: OG_HEIGHT,
};

/** `--bg-0` from DESIGN.md. */
export const BACKGROUND = '#08070b';

/** Logo width in px — leaves ~55px each side inside SAFE_ZONE. */
export const LOGO_WIDTH = 520;

const logoPath = fileURLToPath(new URL('../public/marmibas-logo.png', import.meta.url));
const outPath = fileURLToPath(new URL('../public/og/default.png', import.meta.url));

export async function renderOgImage() {
  const logo = await sharp(logoPath).resize({ width: LOGO_WIDTH }).png().toBuffer();
  const { height = 0 } = await sharp(logo).metadata();

  return sharp({
    create: { width: OG_WIDTH, height: OG_HEIGHT, channels: 3, background: BACKGROUND },
  })
    .composite([
      {
        input: logo,
        left: Math.round((OG_WIDTH - LOGO_WIDTH) / 2),
        top: Math.round((OG_HEIGHT - height) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const png = await renderOgImage();
  writeFileSync(outPath, png);
  console.log(`Wrote ${outPath} (${(png.byteLength / 1024).toFixed(1)} KB)`);
}
