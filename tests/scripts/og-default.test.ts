/**
 * Contract for the default Open Graph image (`public/og/default.png`).
 *
 * Chat apps do not show the full 1200x630 card: WhatsApp's small preview and
 * most thumbnails crop the centre of the image, down to a square in the
 * narrowest case. Text placed near the left edge got cut ("oftware para",
 * "u negocio."), so every line of text must fit the centred square.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  OG_HEIGHT,
  OG_WIDTH,
  SAFE_ZONE,
  renderOgImage,
  renderSvg,
} from '../../scripts/generate-og-default.mjs';

const MAX_BYTES = 300 * 1024;

async function inkWidth(family: string, text: string): Promise<number> {
  const { bbox } = await renderSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="200"><text x="10" y="100" font-family="${family}" font-size="50">${text}</text></svg>`
  );
  if (!bbox) throw new Error(`${family} rendered no ink for "${text}"`);
  return bbox.width;
}

describe('default Open Graph image', () => {
  it('keeps every line of text inside the centred square chat apps crop to', async () => {
    const { bbox } = await renderOgImage({ contentOnly: true });

    expect(bbox).toBeDefined();
    if (!bbox) return;
    expect(bbox.x).toBeGreaterThanOrEqual(SAFE_ZONE.x);
    expect(bbox.x + bbox.width).toBeLessThanOrEqual(SAFE_ZONE.x + SAFE_ZONE.width);
    expect(bbox.y).toBeGreaterThanOrEqual(SAFE_ZONE.y);
    expect(bbox.y + bbox.height).toBeLessThanOrEqual(SAFE_ZONE.y + SAFE_ZONE.height);
  });

  it.each(['Space Mono', 'IBM Plex Mono'])(
    'draws real %s glyphs from the self-hosted files, not a fallback',
    async (family) => {
      const narrow = await inkWidth(family, '..........');
      const wide = await inkWidth(family, 'MMMMMMMMMM');

      // Monospace: both runs share nine advances (~30px each at 50px); only the
      // ink of the last glyph differs. A proportional font differs by >200px,
      // and a face missing the glyphs draws identical .notdef boxes (0px).
      const inkDifference = wide - narrow;
      expect(inkDifference).toBeLessThan(30);
      expect(inkDifference).toBeGreaterThan(5);
    }
  );

  it('resolves Space Mono and IBM Plex Mono to different faces', async () => {
    const sample = 'Software a medida';

    // An unmatched family silently falls back to the default (IBM Plex Mono).
    expect(
      Math.abs((await inkWidth('Space Mono', sample)) - (await inkWidth('IBM Plex Mono', sample)))
    ).toBeGreaterThan(3);
  });

  it('defines the safe zone as the centred square of the card', () => {
    expect(SAFE_ZONE).toEqual({
      x: (OG_WIDTH - OG_HEIGHT) / 2,
      y: 0,
      width: OG_HEIGHT,
      height: OG_HEIGHT,
    });
  });

  it('ships a PNG with the size SeoHead declares and light enough for WhatsApp', () => {
    const png = readFileSync(new URL('../../public/og/default.png', import.meta.url));

    // PNG IHDR: width and height are big-endian uint32 at bytes 16 and 20.
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
    expect(png.byteLength).toBeLessThan(MAX_BYTES);
  });
});
