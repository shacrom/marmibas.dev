/**
 * `getFooterTree` — footer "tree" link data (T3 terminal redesign,
 * `odd/tasks/terminal-redesign.md` T3).
 *
 * Extracts, as pure data, the 3 link groups the terminal footer renders as
 * a `tree`-style listing (DESIGN.md §8 pane contract,
 * `FooterTerminal.dc.html` mockup): `site` (primary nav, reusing
 * `getPrimaryNav` from T2 so header/footer link order always stays in
 * sync), `social` (GitHub/LinkedIn/email/phone/WhatsApp — same
 * hrefs/constants as the pre-terminal `Footer.astro`), and `more` (cookie
 * policy — same href as today; the blog/RSS feed was removed, so `more`
 * no longer lists an RSS link).
 *
 * Visible labels are intentionally all lower-case (`inicio`, `github`,
 * `whatsapp`...), matching the mockup's literal `tree`/path-listing aesthetic —
 * this is a deliberate typographic choice for this component, not
 * sentence-casing carried over from the rest of the site's copy.
 */

import { useTranslations } from '../i18n/helpers';
import { getPrimaryNav } from './navigation';
import type { Language } from '../i18n/ui';

/** Matches `useTranslations`'s return type exactly (narrower than `(key: string) => string`). */
type Translate = ReturnType<typeof useTranslations>;

export interface FooterTreeItem {
  /** Visible link text (lower-case, tree-listing style). */
  label: string;
  href: string;
  /** True when the link should open in a new tab with `rel="noopener"`. */
  external?: boolean;
  /** Optional accessible name override when `label` alone is ambiguous. */
  ariaLabel?: string;
}

export interface FooterTreeGroup {
  key: 'site' | 'social' | 'more';
  /** Decorative lower-case heading with a trailing slash, e.g. `'sitio/'`. */
  heading: string;
  /** Proper-case label for the group's `<nav aria-label>`. */
  ariaLabel: string;
  items: FooterTreeItem[];
}

// Social + legal constants — moved here (single source of truth) from the
// pre-terminal `Footer.astro`, unchanged.
const EMAIL = 'info@marmibas.dev';
const PHONE_DISPLAY = '+34 614 22 42 36';
const PHONE_HREF = '+34614224236';
// WhatsApp uses the international number without "+" or spaces (wa.me format).
const WHATSAPP_HREF = 'https://wa.me/34614224236';
const GITHUB_URL = 'https://github.com/shacrom';
const LINKEDIN_URL = 'https://www.linkedin.com/in/marcos-miguel-b%C3%A1scones-91669b205/';

function getSiteGroup(lang: Language): FooterTreeGroup {
  const items: FooterTreeItem[] = getPrimaryNav(lang, '').map((item) => ({
    label: item.label.toLowerCase(),
    href: item.href,
  }));

  return {
    key: 'site',
    heading: 'sitio/',
    ariaLabel: 'Sitio',
    items,
  };
}

function getSocialGroup(t: Translate): FooterTreeGroup {
  const items: FooterTreeItem[] = [
    {
      label: 'github',
      href: GITHUB_URL,
      external: true,
      ariaLabel: t('footer.social.github'),
    },
    {
      label: 'linkedin',
      href: LINKEDIN_URL,
      external: true,
      ariaLabel: t('footer.social.linkedin'),
    },
    {
      label: EMAIL,
      href: `mailto:${EMAIL}`,
      ariaLabel: t('footer.social.email'),
    },
    {
      label: PHONE_DISPLAY,
      href: `tel:${PHONE_HREF}`,
      ariaLabel: `Llamar al ${PHONE_DISPLAY}`,
    },
    {
      label: 'whatsapp',
      href: WHATSAPP_HREF,
      external: true,
      ariaLabel: `Escríbeme por WhatsApp al ${PHONE_DISPLAY}`,
    },
  ];

  return {
    key: 'social',
    heading: 'social/',
    ariaLabel: 'Social',
    items,
  };
}

function getMoreGroup(): FooterTreeGroup {
  const items: FooterTreeItem[] = [
    {
      label: 'política de cookies',
      href: '/politica-cookies',
    },
  ];

  return {
    key: 'more',
    heading: 'más/',
    ariaLabel: 'Más',
    items,
  };
}

/**
 * Builds the footer's 3 tree groups (`site`, `social`, `more`) for `lang`,
 * in the order the pane renders its columns.
 */
export function getFooterTree(lang: Language): FooterTreeGroup[] {
  const t = useTranslations(lang);

  return [getSiteGroup(lang), getSocialGroup(t), getMoreGroup()];
}
