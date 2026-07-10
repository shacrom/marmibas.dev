import { describe, expect, it } from 'vitest';

import { absoluteUrl, canonicalUrlFor, siteOriginFromConfiguredUrl } from '../src/lib/seo';

describe('SEO URL construction', () => {
  it('keeps a valid root canonical URL while removing query strings and hashes', () => {
    expect(
      canonicalUrlFor(
        new URL('http://localhost:4322/?utm_source=test#section'),
        'https://marmibas.dev'
      )
    ).toBe('https://marmibas.dev/');
  });

  it('preserves a trailing slash and uses the configured origin', () => {
    expect(
      canonicalUrlFor(
        new URL('http://localhost:4322/servicios/desarrollo-aplicaciones-web/'),
        'https://marmibas.dev/'
      )
    ).toBe('https://marmibas.dev/servicios/desarrollo-aplicaciones-web/');
  });

  it('keeps network-path pathnames on the configured origin and removes query strings and hashes', () => {
    expect(
      canonicalUrlFor(
        new URL('http://localhost:4322//attacker.example/x?utm_source=test#section'),
        'https://marmibas.dev'
      )
    ).toBe('https://marmibas.dev//attacker.example/x');
  });

  it('accepts bare HTTPS origins with or without a trailing slash', () => {
    expect(siteOriginFromConfiguredUrl('https://preview.marmibas.dev')).toBe(
      'https://preview.marmibas.dev'
    );
    expect(siteOriginFromConfiguredUrl('https://preview.marmibas.dev/')).toBe(
      'https://preview.marmibas.dev'
    );
  });

  it('falls back to the production origin for malformed or unsupported configured URLs', () => {
    for (const configuredUrl of [
      'not a URL',
      'http://marmibas.dev',
      'https://marmibas.dev/path',
      'https://user:marmibas.dev',
    ]) {
      expect(siteOriginFromConfiguredUrl(configuredUrl)).toBe('https://marmibas.dev');
    }
  });

  it('makes relative social images absolute from root, trailing-slash, and path-relative values', () => {
    expect(absoluteUrl('/og/default.png', 'https://marmibas.dev')).toBe(
      'https://marmibas.dev/og/default.png'
    );
    expect(absoluteUrl('og/default.png', 'https://marmibas.dev/')).toBe(
      'https://marmibas.dev/og/default.png'
    );
    expect(absoluteUrl('/', 'https://marmibas.dev')).toBe('https://marmibas.dev/');
  });

  it('keeps HTTPS image URLs and safely falls back for malformed values', () => {
    expect(absoluteUrl('https://cdn.example.com/og.png', 'https://marmibas.dev')).toBe(
      'https://cdn.example.com/og.png'
    );
    expect(absoluteUrl('http://cdn.example.com/og.png', 'https://marmibas.dev')).toBe(
      'https://marmibas.dev/og/default.png'
    );
    expect(absoluteUrl('http://%', 'not a URL')).toBe('https://marmibas.dev/og/default.png');
  });
});
