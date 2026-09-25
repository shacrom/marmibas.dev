/**
 * Regression tests for the permanent redirects declared in `vercel.json`.
 *
 * The blog and the English version were removed (see `odd/tasks/site-cleanup.md`)
 * and their public URLs must keep resolving. Google indexed them WITH a trailing
 * slash (e.g. `/blog/cuanto-cuesta-software-a-medida/`), which `:path*` sources do
 * not match on Vercel. These tests compile the redirects with Vercel's own
 * routing utilities, so what passes here is what the platform will serve.
 *
 * S3 (`odd/tasks/services-mosaic.md`) removed the 7 `/servicios/<slug>/`
 * detail pages and folded their content into `/servicios`' mosaic drawers.
 * Those URLs were live/indexed too, so they get the same trailing-slash-aware
 * 308 treatment, redirecting to the mosaic's own deep-link hash
 * (`/servicios/#<slug>`) instead of `/`.
 */

import { readFileSync } from 'node:fs';
import { getTransformedRoutes } from '@vercel/routing-utils';
import { describe, expect, it } from 'vitest';

interface VercelConfig {
  redirects?: Parameters<typeof getTransformedRoutes>[0]['redirects'];
}

const config = JSON.parse(
  readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8')
) as VercelConfig;

const { routes, error } = getTransformedRoutes({ redirects: config.redirects });

interface Resolved {
  status: number | undefined;
  location: string;
}

/** Returns the first redirect matching `path`, or null when no redirect applies. */
function resolveRedirect(path: string): Resolved | null {
  for (const route of routes ?? []) {
    // Redirects compile to source routes (`src` + `headers.Location` + `status`);
    // phase handler routes (`handle: ...`) are skipped.
    if ('handle' in route) continue;
    const match = new RegExp(route.src).exec(path);
    if (!match) continue;
    const template = route.headers?.Location ?? '';
    const location = template
      .replace(/\$(\d+)/g, (_: string, index: string) => match[Number(index)] ?? '')
      .replace(/\$([A-Za-z_]\w*)/g, (_: string, name: string) => match.groups?.[name] ?? '');
    return { status: route.status, location };
  }
  return null;
}

describe('vercel.json redirects', () => {
  it('compiles without errors', () => {
    expect(error).toBeNull();
  });

  it.each([
    ['/blog', '/'],
    ['/blog/', '/'],
    ['/blog/cuanto-cuesta-software-a-medida', '/'],
    ['/blog/cuanto-cuesta-software-a-medida/', '/'],
    ['/blog/como-digitalizar-tu-negocio/', '/'],
    ['/blog/errores-al-contratar-desarrollador/', '/'],
    ['/rss.xml', '/'],
    ['/en', '/'],
    ['/en/', '/'],
    ['/en/work', '/trabajos/'],
    ['/en/work/', '/trabajos/'],
    ['/en/experience', '/experiencia/'],
    ['/en/experience/', '/experiencia/'],
    ['/en/contact', '/contacto/'],
    ['/en/contact/', '/contacto/'],
    ['/en/cookie-policy', '/politica-cookies/'],
    ['/en/cookie-policy/', '/politica-cookies/'],
    ['/en/case-studies/voxye', '/case-studies/voxye/'],
    ['/en/case-studies/voxye/', '/case-studies/voxye/'],
    ['/en/case-studies/other-case', '/trabajos/'],
    ['/en/case-studies/other-case/', '/trabajos/'],
    ['/en/projects/some-project', '/trabajos/'],
    ['/en/projects/some-project/', '/trabajos/'],
    ['/en/blog/', '/'],
    ['/en/anything/else/', '/'],
    ['/proyectos/jinba', '/trabajos/'],
    ['/proyectos/jinba/', '/trabajos/'],
    ['/proyectos/acompana', '/trabajos/'],
    ['/proyectos/acompana/', '/trabajos/'],
  ])('permanently redirects %s to %s', (from, to) => {
    const resolved = resolveRedirect(from);
    expect(resolved).not.toBeNull();
    expect(resolved?.location).toBe(to);
    expect(resolved?.status).toBe(308);
  });

  it.each([
    ['/servicios/tiendas-online', '/servicios/#tiendas-online'],
    ['/servicios/tiendas-online/', '/servicios/#tiendas-online'],
    ['/servicios/sistemas-de-gestion', '/servicios/#sistemas-de-gestion'],
    ['/servicios/sistemas-de-gestion/', '/servicios/#sistemas-de-gestion'],
    ['/servicios/aplicaciones-moviles', '/servicios/#aplicaciones-moviles'],
    ['/servicios/aplicaciones-moviles/', '/servicios/#aplicaciones-moviles'],
    ['/servicios/automatizaciones', '/servicios/#automatizaciones'],
    ['/servicios/automatizaciones/', '/servicios/#automatizaciones'],
    ['/servicios/webs-corporativas', '/servicios/#webs-corporativas'],
    ['/servicios/webs-corporativas/', '/servicios/#webs-corporativas'],
    ['/servicios/desarrollo-aplicaciones-web', '/servicios/#desarrollo-aplicaciones-web'],
    ['/servicios/desarrollo-aplicaciones-web/', '/servicios/#desarrollo-aplicaciones-web'],
    ['/servicios/integraciones', '/servicios/#integraciones'],
    ['/servicios/integraciones/', '/servicios/#integraciones'],
  ])('permanently redirects the removed service page %s to %s', (from, to) => {
    const resolved = resolveRedirect(from);
    expect(resolved).not.toBeNull();
    expect(resolved?.location).toBe(to);
    expect(resolved?.status).toBe(308);
  });

  it.each(['/', '/servicios/', '/trabajos/', '/case-studies/voxye/', '/contacto/'])(
    'leaves the live page %s untouched',
    (path) => {
      expect(resolveRedirect(path)).toBeNull();
    }
  );
});
