# marmibas.dev

Portfolio personal de marmibas — Ingeniero Informático y Full Stack Developer. Una vitrina técnica honesta de proyectos, experiencia y artículos, en español e inglés.

## Stack

- **[Astro 6](https://astro.build/)** — generador estático con islas interactivas.
- **TypeScript strict** — `noUncheckedIndexedAccess`, `verbatimModuleSyntax`.
- **[Tailwind v4](https://tailwindcss.com/)** — CSS-first vía `@theme`, sin `tailwind.config.js`.
- **i18n nativo de Astro** — ES default sin prefijo, EN bajo `/en`, fallback rewrite a ES.
- **MDX** — case studies y posts con componentes (Callout, MetricsGrid, etc.).
- **[Resend](https://resend.com/)** — backend del form de contacto.
- **[Vercel](https://vercel.com/)** — hosting + Web Analytics + adapter `@astrojs/vercel`.

Fuentes self-hosted: Geist Sans (display), Inter (sans), JetBrains Mono (mono). Detalle en `public/fonts/LICENSES.md`.

## Desarrollo

Requisitos:

- **Node ≥22** (ver `.nvmrc`).
- **npm** (también funciona pnpm/bun, no testeado).

Setup inicial:

```bash
nvm use            # carga Node 22 desde .nvmrc
npm install        # instala dependencias
cp .env.example .env.local   # copia y rellena con tus valores
```

Comandos disponibles:

| Script             | Qué hace                                        |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Levanta el dev server de Astro en `http://localhost:4322`. |
| `npm run build`    | Build estático a `dist/`.                       |
| `npm run preview`  | Sirve el build local para revisión final.      |
| `npm run check`    | `astro check` + `tsc --noEmit` (typecheck).     |
| `npm run lint`     | ESLint con `--max-warnings=0`.                  |
| `npm run format`   | Prettier sobre todo el repo.                    |
| `npm run test`     | Vitest (unit tests, modo run).                  |
| `npm run size`     | `du -sh dist` para sanity check del bundle.     |

Variables de entorno mínimas (ver `.env.example`):

- `RESEND_API_KEY` — secret de Resend para el endpoint `/api/contact`.
- `CONTACT_TO_EMAIL` — email destino del form (default `marmibas.dev@gmail.com`).
- `PUBLIC_SITE_URL` — URL pública canónica (`https://marmibas.dev`).

## Despliegue

Auto-deploy en [Vercel](https://vercel.com/) en cada push a `main`. Las branches generan preview deploys automáticos. La configuración de framework + headers de seguridad + cache de fuentes vive en `vercel.json`. Las env vars se gestionan en el dashboard de Vercel para Production y Preview.

## Estructura

```
.
├── DESIGN.md              # Sistema de diseño (paleta, tipografía, motion)
├── TASKS.md               # Plan de tareas vivas del bootstrap
├── astro.config.mjs       # i18n, adapter Vercel, integrations
├── public/
│   ├── fonts/             # Geist Sans + Inter + JetBrains Mono (woff2)
│   ├── og/                # Imágenes Open Graph
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── content/           # MDX collections: case-studies, projects, experience, posts
│   ├── components/        # layout/, ui/, home/, interactive/
│   ├── i18n/              # ui.ts (diccionarios), routes.ts, helpers.ts
│   ├── layouts/           # BaseLayout, CaseStudyLayout, PostLayout, ProjectDetailLayout
│   ├── lib/               # content.ts (helpers de collections)
│   ├── pages/             # index, trabajos/, blog/, experiencia/, contacto, en/, api/
│   └── styles/            # global.css, motion.css, prose.css
├── vercel.json            # framework + security headers + font cache
└── package.json
```

## Documentación viva

- **[`DESIGN.md`](./DESIGN.md)** — paleta oscura morada, tipografía, motion, gradientes. Es la fuente de verdad visual.
- **[`TASKS.md`](./TASKS.md)** — plan ejecutable v1 (59 tareas) con dependencias, criterios `Done` y top 3 riesgos.

Cualquier cambio significativo de arquitectura o convención debe reflejarse en uno de estos dos documentos antes de cerrar el PR.

## Licencia

[MIT](./LICENSE) — código del repo. Las fuentes de `public/fonts/` mantienen su licencia SIL OFL original (ver `public/fonts/LICENSES.md`).
