/**
 * Content collections for marmibas.dev
 *
 * Astro 6 Content Layer API: this file MUST live at `src/content.config.ts`
 * (legacy `src/content/config.ts` is no longer supported in Astro 6).
 *
 * Per-collection content lives under `src/content/<collection>/<lang>/`.
 * The `lang` frontmatter field is the canonical source of truth (helpers in
 * `src/lib/content.ts` filter by it); the folder split is purely organizational.
 *
 * Schemas follow TASKS.md T-15 as the canonical spec (case-studies / projects
 * / experience / posts) plus the project-wide shared fields (lang, draft,
 * featured, order, heroImage, ogImage) layered on top via `sharedBase`.
 *
 * Note on the `image()` helper: Astro injects it via `schema: ({ image }) =>`.
 * Image fields therefore live inline inside each collection's schema callback
 * — extracting them into a shared helper would force us to re-type Astro's
 * private internals, which breaks across versions. The non-image shared
 * fields are lifted into `sharedBase` instead.
 */
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const LANGS = ["es", "en"] as const;

/**
 * Project-wide frontmatter every collection inherits — except for the image
 * fields, which are appended inline in each schema callback (see file header).
 */
const sharedBase = z.object({
  title: z.string(),
  description: z.string(),
  lang: z.enum(LANGS),
  draft: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  order: z.number().optional(),
});

/**
 * Case studies — flagship engagements (Voxye, Recetas Novatex).
 * status is locked to `'success'`: only shipped, validated work appears here.
 */
const caseStudies = defineCollection({
  loader: glob({
    base: "./src/content/case-studies",
    pattern: "**/*.{md,mdx}",
  }),
  schema: ({ image }) =>
    sharedBase.extend({
      heroImage: image().optional(),
      ogImage: image().optional(),
      tagline: z.string(),
      // Public paths to the product logo and the client's brand logo
      // (e.g. "/logos/voxye.svg"). Rendered as tiles on the card.
      logo: z.string().optional(),
      clientLogo: z.string().optional(),
      client: z.string(),
      year: z.number().int(),
      role: z.string(),
      stack: z.array(z.string()).min(1),
      status: z.literal("success"),
      results: z.array(z.string()).optional(),
      metrics: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
            sublabel: z.string().optional(),
          })
        )
        .optional(),
      publishedAt: z.coerce.date().optional(),
    }),
});

/**
 * Projects — owned products and side projects (Jinba, Acompaña, Feed Me, Puro Padel).
 * Distinct from case-studies: they ship under my own name, may be in flux.
 */
const projects = defineCollection({
  loader: glob({
    base: "./src/content/projects",
    pattern: "**/*.{md,mdx}",
  }),
  schema: ({ image }) =>
    sharedBase.extend({
      heroImage: image().optional(),
      ogImage: image().optional(),
      pitch: z.string(),
      // Public path to the project logo (e.g. "/logos/visomos.svg").
      logo: z.string().optional(),
      stack: z.array(z.string()).min(1),
      status: z.enum(["in-development", "side-project", "paused"]),
      year: z.number().int().optional(),
      repo: z.string().url().optional(),
      liveUrl: z.string().url().optional(),
      links: z
        .array(
          z.object({
            label: z.string(),
            url: z.string().url(),
          })
        )
        .optional(),
    }),
});

/**
 * Experience — employment history (Capgemini x2, Cleverpy x2, Devoltec).
 * `period` is the human-readable display string ("Mar 2023 — Jul 2024").
 * `startDate` / `endDate` / `current` exist for chronological sorting and
 * rendering "Present" badges. `endDate` undefined + `current: true` = active.
 */
const experience = defineCollection({
  loader: glob({
    base: "./src/content/experience",
    pattern: "**/*.{md,mdx}",
  }),
  schema: ({ image }) =>
    sharedBase.extend({
      heroImage: image().optional(),
      ogImage: image().optional(),
      company: z.string(),
      // Public path to the company logo (e.g. "/logos/capgemini.png").
      logo: z.string().optional(),
      // Official company website. Experience cards use it as their external link.
      companyUrl: z.string().url(),
      role: z.string(),
      period: z.string(),
      startDate: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      current: z.boolean().optional().default(false),
      summary: z.string().optional(),
      stack: z.array(z.string()).optional(),
      location: z.string().optional(),
    }),
});

/**
 * Posts — blog entries. Empty initially; grows over time.
 * `publishedAt` is required (sort key); `updatedAt` optional (article meta).
 */
const posts = defineCollection({
  loader: glob({
    base: "./src/content/posts",
    pattern: "**/*.{md,mdx}",
  }),
  schema: ({ image }) =>
    sharedBase.extend({
      heroImage: image().optional(),
      ogImage: image().optional(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      tags: z.array(z.string()).optional(),
      readingTime: z.number().optional(),
      canonical: z.string().url().optional(),
    }),
});

export const collections = {
  "case-studies": caseStudies,
  projects,
  experience,
  posts,
};
