/**
 * Contract for the default Open Graph image (`public/og/default.png`).
 *
 * The card shows only the Marmibas logo on the site background (owner
 * request). Chat apps do not show the full 1200x630 card: WhatsApp's small
 * preview and most thumbnails crop the centre of the image, down to a square
 * in the narrowest case, so the logo must fit that centred square.
 */

import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import {
  BACKGROUND,
  LOGO_WIDTH,
  OG_HEIGHT,
  OG_WIDTH,
  SAFE_ZONE,
  renderOgImage,
} from '../../scripts/generate-og-default.mjs';

const MAX_BYTES = 300 * 1024;

/** Bounding box of every pixel that is not the plain background. */
async function contentBox(png: Buffer) {
  const { info } = await sharp(png)
    .trim({ background: BACKGROUND, threshold: 10 })
    .toBuffer({ resolveWithObject: true });
  const x = -(info.trimOffsetLeft ?? 0);
  const y = -(info.trimOffsetTop ?? 0);
  return { x, y, width: info.width, height: info.height };
}

describe('default Open Graph image', () => {
  it('draws only the Marmibas logo, centred on the background', async () => {
    const png = await renderOgImage();
    const box = await contentBox(png);
    const logo = await sharp(
      readFileSync(new URL('../../public/marmibas-logo.png', import.meta.url))
    ).metadata();
    const logoHeight = Math.round(((logo.height ?? 0) * LOGO_WIDTH) / (logo.width ?? 1));

    // Nothing else is drawn: the content box is the logo's own box.
    expect(box.width).toBeLessThanOrEqual(LOGO_WIDTH);
    expect(box.width).toBeGreaterThan(LOGO_WIDTH - 8);
    expect(box.height).toBeLessThanOrEqual(logoHeight);
    expect(box.height).toBeGreaterThan(logoHeight - 8);
    // Centred on both axes (within a few px of transparent logo padding).
    expect(Math.abs(box.x + box.width / 2 - OG_WIDTH / 2)).toBeLessThan(6);
    expect(Math.abs(box.y + box.height / 2 - OG_HEIGHT / 2)).toBeLessThan(6);
  });

  it('keeps the logo inside the centred square chat apps crop to', async () => {
    const box = await contentBox(await renderOgImage());

    expect(box.x).toBeGreaterThanOrEqual(SAFE_ZONE.x);
    expect(box.x + box.width).toBeLessThanOrEqual(SAFE_ZONE.x + SAFE_ZONE.width);
    expect(box.y).toBeGreaterThanOrEqual(SAFE_ZONE.y);
    expect(box.y + box.height).toBeLessThanOrEqual(SAFE_ZONE.y + SAFE_ZONE.height);
  });

  it('defines the safe zone as the centred square of the card', () => {
    expect(SAFE_ZONE).toEqual({
      x: (OG_WIDTH - OG_HEIGHT) / 2,
      y: 0,
      width: OG_HEIGHT,
      height: OG_HEIGHT,
    });
  });

  it('ships the generated PNG, sized as SeoHead declares and light enough for WhatsApp', async () => {
    const png = readFileSync(new URL('../../public/og/default.png', import.meta.url));

    // PNG IHDR: width and height are big-endian uint32 at bytes 16 and 20.
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
    expect(png.byteLength).toBeLessThan(MAX_BYTES);
    // The committed file is the generator's current output, not a stale one.
    const committed = await sharp(png).raw().toBuffer();
    const fresh = await sharp(await renderOgImage())
      .raw()
      .toBuffer();
    expect(committed.equals(fresh)).toBe(true);
  });
});
