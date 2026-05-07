/**
 * `/rss.xml` — feed RSS del blog en español · T-52.
 *
 * Genera un feed RSS 2.0 con los posts publicados en `lang === 'es'`,
 * excluyendo borradores. Si la collection está vacía, el feed se genera
 * igualmente con 0 items (sigue siendo XML válido).
 *
 * Notas:
 *   - `context.site` proviene de `site` en `astro.config.mjs`. Fallback a
 *     `https://marmibas.dev` por seguridad si por algún motivo no estuviera
 *     definido en build.
 *   - Los items se ordenan por `publishedAt` DESC (último publicado primero),
 *     coherente con la lista en `/blog`.
 *   - `link` es relativo (`/blog/<slug>`); `@astrojs/rss` lo resuelve contra
 *     `site` para producir URLs absolutas en el XML final.
 *   - `slugFromId` extrae el último segmento del `entry.id` (Astro 6 Content
 *     Layer: el id es relativo al base loader, p.ej. `es/foo`).
 */
import rss from '@astrojs/rss';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIContext } from 'astro';
import { slugFromId } from '@/lib/content';

type PostEntry = CollectionEntry<'posts'>;

export async function GET(context: APIContext) {
  const posts: PostEntry[] = await getCollection(
    'posts',
    (entry: PostEntry) => entry.data.lang === 'es' && entry.data.draft !== true,
  );

  posts.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );

  return rss({
    title: 'marmibas.dev',
    description: 'Notas técnicas, decisiones y aprendizajes desde el camino.',
    site: context.site ?? 'https://marmibas.dev',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: `/blog/${slugFromId(post.id)}`,
    })),
    customData: `<language>es</language>`,
  });
}
