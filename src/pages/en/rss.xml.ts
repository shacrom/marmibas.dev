/**
 * `/en/rss.xml` — English blog RSS feed · T-52.
 *
 * Mirrors `src/pages/rss.xml.ts` but filters posts by `lang === 'en'` and
 * emits English-localized link paths (`/en/blog/<slug>`) and `<language>en</language>`.
 *
 * See the Spanish sibling for shared design notes (sorting, `context.site`
 * fallback, empty-collection behavior).
 */
import rss from '@astrojs/rss';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIContext } from 'astro';
import { slugFromId } from '@/lib/content';

type PostEntry = CollectionEntry<'posts'>;

export async function GET(context: APIContext) {
  const posts: PostEntry[] = await getCollection(
    'posts',
    (entry: PostEntry) => entry.data.lang === 'en' && entry.data.draft !== true,
  );

  posts.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );

  return rss({
    title: 'marmibas.dev',
    description: 'Technical notes, decisions, and lessons learned along the way.',
    site: context.site ?? 'https://marmibas.dev',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: `/en/blog/${slugFromId(post.id)}`,
    })),
    customData: `<language>en</language>`,
  });
}
