/**
 * Tests for `getFooterTree` (`src/lib/footer.ts`) — T3 terminal redesign.
 *
 * `getFooterTree(lang)` extracts the footer's "tree" link data (DESIGN.md
 * §8 pane contract, `FooterTerminal.dc.html` mockup): 3 groups (`site`,
 * `social`, `more`), each with a decorative lowercase `heading` (e.g.
 * `'sitio/'`), a proper-case `ariaLabel` for the group's `<nav>`, and an
 * ordered list of `{label, href, external?, ariaLabel?}` items.
 *
 * `site` reuses `getPrimaryNav` (T2) so the footer's site links always
 * stay in the same order as the header's. `social`/`more` reuse the exact
 * hrefs/constants the previous (pre-terminal) `Footer.astro` used — same
 * GitHub/LinkedIn/email/phone/WhatsApp URLs, same cookie-policy path.
 *
 * Plan (strict TDD — written and observed RED before `src/lib/footer.ts`
 * exists):
 *   1. ES: 3 groups in order `site`/`social`/`more`, with the exact
 *      decorative headings and `<nav>` aria-labels.
 *   2. EN: same 3 groups, EN headings/aria-labels, no ES-only strings.
 *   3. ES `site` group: labels/hrefs/order mirror
 *      `getPrimaryNav('es', '')` lower-cased (home, services, work,
 *      experience, contact).
 *   4. EN `site` group: mirrors `getPrimaryNav('en', '')` (no services).
 *   5. ES `social` group: exact hrefs/order/external flags for
 *      GitHub/LinkedIn/email/phone/WhatsApp.
 *   6. ES `more` group: cookie policy href `/politica-cookies` only (no RSS
 *      link — the blog/RSS feed was removed). EN: `/en/cookie-policy`.
 */

import { describe, expect, it } from 'vitest';
import { getFooterTree } from '../../src/lib/footer';
import { getPrimaryNav } from '../../src/lib/navigation';

describe('getFooterTree', () => {
  it('returns the ES groups in order with their decorative headings and nav aria-labels', () => {
    const tree = getFooterTree('es');

    expect(tree.map((group) => group.key)).toEqual(['site', 'social', 'more']);
    expect(tree.map((group) => group.heading)).toEqual(['sitio/', 'social/', 'más/']);
    expect(tree.map((group) => group.ariaLabel)).toEqual(['Sitio', 'Social', 'Más']);
  });

  it('returns the EN groups in order with EN headings and nav aria-labels', () => {
    const tree = getFooterTree('en');

    expect(tree.map((group) => group.key)).toEqual(['site', 'social', 'more']);
    expect(tree.map((group) => group.heading)).toEqual(['site/', 'social/', 'more/']);
    expect(tree.map((group) => group.ariaLabel)).toEqual(['Site', 'Social', 'More']);
  });

  it("ES 'site' group mirrors getPrimaryNav order/hrefs, lower-cased labels", () => {
    const tree = getFooterTree('es');
    const site = tree.find((group) => group.key === 'site');
    const expectedNav = getPrimaryNav('es', '');

    expect(site?.items.map((item) => item.label)).toEqual(
      expectedNav.map((item) => item.label.toLowerCase())
    );
    expect(site?.items.map((item) => item.href)).toEqual(expectedNav.map((item) => item.href));
    // Sanity: 5 items, services included, in Header order (home first).
    expect(site?.items.map((item) => item.label)).toEqual([
      'inicio',
      'servicios',
      'trabajos',
      'experiencia',
      'contacto',
    ]);
  });

  it("EN 'site' group mirrors getPrimaryNav (no services)", () => {
    const tree = getFooterTree('en');
    const site = tree.find((group) => group.key === 'site');

    expect(site?.items.map((item) => item.label)).toEqual([
      'home',
      'work',
      'experience',
      'contact',
    ]);
  });

  it("ES 'social' group has the exact hrefs/order/external flags", () => {
    const tree = getFooterTree('es');
    const social = tree.find((group) => group.key === 'social');

    expect(social?.items).toEqual([
      expect.objectContaining({
        label: 'github',
        href: 'https://github.com/shacrom',
        external: true,
      }),
      expect.objectContaining({
        label: 'linkedin',
        href: 'https://www.linkedin.com/in/marcos-miguel-b%C3%A1scones-91669b205/',
        external: true,
      }),
      expect.objectContaining({
        label: 'info@marmibas.dev',
        href: 'mailto:info@marmibas.dev',
      }),
      expect.objectContaining({
        label: '+34 614 22 42 36',
        href: 'tel:+34614224236',
      }),
      expect.objectContaining({
        label: 'whatsapp',
        href: 'https://wa.me/34614224236',
        external: true,
      }),
    ]);
    // Email/phone are not "external" (no target=_blank / rel=noopener needed).
    expect(social?.items[2]?.external).toBeFalsy();
    expect(social?.items[3]?.external).toBeFalsy();
  });

  it("ES 'more' group has only the cookie-policy href (no RSS link); EN uses the /en/ prefix", () => {
    const esMore = getFooterTree('es').find((group) => group.key === 'more');
    expect(esMore?.items.map((item) => item.href)).toEqual(['/politica-cookies']);

    const enMore = getFooterTree('en').find((group) => group.key === 'more');
    expect(enMore?.items.map((item) => item.href)).toEqual(['/en/cookie-policy']);
  });
});
