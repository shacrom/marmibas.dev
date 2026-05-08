/**
 * Extract the slug (file basename) from a content entry `id`.
 *
 * With Astro 6 glob loaders rooted at e.g. `./src/content/case-studies`,
 * `entry.id` is a relative path like `"es/voxye"`. We only want the last
 * segment for URL routing — the language is already encoded in the page route.
 */
export function slugFromId(id: string): string {
  const parts = id.split('/');
  return parts[parts.length - 1] ?? id;
}
