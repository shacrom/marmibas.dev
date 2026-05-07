# TASKS.md — marmibas.dev (change `marmibas-dev-bootstrap`)

> **Estado**: plan ejecutable v1. Generado tras CHECKPOINT 1 (proposal aprobada) + CHECKPOINT 2 (spec + design).
> **Fuentes de verdad**:
> - `DESIGN.md` (raíz repo) — paleta + tipografía + motion (oscuro + morado, supersede paleta del design técnico).
> - Memoria engram: `sdd/marmibas-dev-bootstrap/{proposal,spec,design,tasks}` + `marmibas-dev/{arranque,proyectos,voxye-tech,cv-experiencia,timeline-y-direccion-visual}`.
> - Spec #1107 (24 RF + 12 RNF + Zod schemas).
> - Design #1108 (estructura, componentes, endpoint, riesgos).

**Convenciones**:
- ID `T-XX`. Estimación `S` (≤30 min), `M` (~30-60 min), `L` (~1-2 h).
- Cada tarea es atómica: implementable en una sola sesión concentrada.
- `Done` = checklist verificable. Si no se cumple, no marcar done.
- Tests con detalle prosa (nombre + qué verifica + aserción) — regla del proyecto.

**Camino crítico** (las que más bloquean): T-02 → T-03 → T-08 → T-15 → T-16 → T-20 → T-33.

**Total**: 59 tareas. Estimación rough: ~21 S + ~28 M + ~10 L ≈ 30-40 horas de implementación neta.

---

## Fase A — Bootstrap del proyecto (5 tareas)

### T-01 — Inicializar `package.json` y scripts npm · S

**Hace**: `npm init -y`, ajusta nombre a `marmibas-dev`, version `0.0.1`, type `module`, license `MIT`, añade scripts.

**Archivos**: `package.json`.

**Done**:
- [ ] `name: "marmibas-dev"`, `version: "0.0.1"`, `private: true`, `type: "module"`.
- [ ] Scripts: `dev`, `build`, `preview`, `check`, `format`, `lint`, `size`.
- [ ] `engines.node: ">=22"`.

**Deps**: ninguna.

---

### T-02 — Instalar Astro 6 + adapter Vercel + integrations base · M

**Hace**: instala Astro 6 stable, `@astrojs/vercel`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `@astrojs/check`, `typescript`, `zod`, `resend`, `shiki`. Crea `.nvmrc` con `22`.

**Archivos**: `package.json` (deps), `package-lock.json`, `.nvmrc`, `node_modules/`.

**Done**:
- [ ] `astro@^6` instalado y resuelve.
- [ ] `npx astro --version` imprime `6.x.x`.
- [ ] Adapter Vercel + integrations todas en `dependencies` o `devDependencies` correctas.
- [ ] `.nvmrc` con `22`.

**Deps**: T-01.

---

### T-03 — Crear `astro.config.mjs` con i18n + adapter + integrations · M

**Hace**: configuración crítica del design §5: `output: 'static'`, adapter Vercel con `webAnalytics`, i18n nativo (ES default sin prefijo, EN bajo `/en`, fallback rewrite a ES), MDX + sitemap con i18n, plugin Tailwind v4 vía Vite.

**Archivos**: `astro.config.mjs`.

**Done**:
- [ ] `i18n.defaultLocale: 'es'`, `locales: ['es', 'en']`, `routing.prefixDefaultLocale: false`, `routing.fallbackType: 'rewrite'`, `fallback: { en: 'es' }`.
- [ ] `site: 'https://marmibas.dev'`.
- [ ] Adapter Vercel con `webAnalytics: { enabled: true }`.
- [ ] Integrations: mdx, sitemap (con i18n config), tailwindcss vite plugin.

**Deps**: T-02.

---

### T-04 — `tsconfig.json` strict + tooling de calidad · S

**Hace**: extiende `astro/tsconfigs/strict`, añade `noUncheckedIndexedAccess`, `verbatimModuleSyntax`. Crea `.editorconfig`, `.prettierrc`, `eslint.config.mjs` (flat config con presets Astro+TS).

**Archivos**: `tsconfig.json`, `.editorconfig`, `.prettierrc`, `eslint.config.mjs`.

**Done**:
- [ ] `tsconfig.json` extiende `astro/tsconfigs/strict`.
- [ ] `noUncheckedIndexedAccess: true` y `strict: true`.
- [ ] `npm run check` ejecuta sin errores en proyecto vacío.
- [ ] `npm run lint` no falla en proyecto vacío.

**Deps**: T-02.

---

### T-05 — `vercel.json`, `.env.example`, README inicial · S

**Hace**: declara framework Astro en `vercel.json` (opcional pero explícito), crea `.env.example` con `RESEND_API_KEY` y `CONTACT_TO_EMAIL`, actualiza `README.md` con descripción + scripts + cómo correr local.

**Archivos**: `vercel.json`, `.env.example`, `README.md`.

**Done**:
- [ ] `vercel.json` declara `framework: "astro"`.
- [ ] `.env.example` lista `RESEND_API_KEY=` y `CONTACT_TO_EMAIL=marmibas.dev@gmail.com` y `PUBLIC_SITE_URL=https://marmibas.dev`.
- [ ] `README.md` cubre: qué es el proyecto, stack, cómo correr `dev`/`build`, link a `DESIGN.md` y `TASKS.md`.

**Deps**: T-01.

---

## Fase B — Sistema de diseño (6 tareas)

### T-06 — Instalar Tailwind v4 + typography · S

**Hace**: instala `tailwindcss@^4`, `@tailwindcss/vite`, `@tailwindcss/typography`. No crea `tailwind.config.js` (usa `@theme` CSS-first).

**Archivos**: `package.json` (deps).

**Done**:
- [ ] Tailwind v4 instalado.
- [ ] Plugin `@tailwindcss/vite` registrado en `astro.config.mjs` (T-03).
- [ ] Plugin typography disponible para MDX prose.

**Deps**: T-02, T-03.

---

### T-07 — Self-host de fuentes (Fraunces + Inter + JetBrains Mono) · M

**Hace**: descarga subsets latin/latin-ext de las 3 familias en formato woff2; coloca en `public/fonts/{fraunces,inter,jetbrains-mono}/`. Fraunces variable (opsz+wght), Inter 400/500/600, JetBrains Mono 400. Genera lista de paths para preload.

**Archivos**: `public/fonts/fraunces/*.woff2`, `public/fonts/inter/*.woff2`, `public/fonts/jetbrains-mono/*.woff2`, `public/fonts/LICENSES.md` (atribuciones SIL OFL).

**Done**:
- [ ] Fraunces variable woff2 presente y accesible vía `/fonts/fraunces/...`.
- [ ] Inter 400 y 500 woff2 presentes.
- [ ] JetBrains Mono 400 woff2 presente.
- [ ] `LICENSES.md` con SIL OFL para las 3 familias.

**Deps**: ninguna.

---

### T-08 — `src/styles/global.css` con `@theme` + reset + base + `@font-face` · L

**Hace**: define todas las CSS custom properties de `DESIGN.md` (paleta oscura morada, status, escala texto, espaciado, radios) en bloque `@theme` Tailwind v4. Añade reset moderno, base styles (body color/font, headings, links, focus), `@font-face` para las 3 fuentes con `font-display: swap`.

**Archivos**: `src/styles/global.css`.

**Done**:
- [ ] `@theme` con vars: `--color-bg-{0,1,2}`, `--color-text-{0,1,2,3}`, `--color-border`, `--color-accent-{100,300,400,500,600,700}`, `--color-accent-glow`, `--color-status-{success,progress,paused,prev}`.
- [ ] Vars de tipografía: `--font-display`, `--font-sans`, `--font-mono`.
- [ ] Vars de escala: `--text-{xs,sm,base,lg,xl,2xl,3xl,4xl,5xl,display}`, leading, tracking.
- [ ] Vars de espaciado y radios.
- [ ] `--gradient-{hero-ambient,cta,cta-hover,text-display,border-featured}` con valores de DESIGN.md §3.
- [ ] Reset CSS: `box-sizing border-box`, `margin: 0`, `body { background: var(--color-bg-0); color: var(--color-text-1); font-family: var(--font-sans) }`.
- [ ] `@font-face` para Fraunces/Inter/JetBrains Mono apuntando a `/fonts/...`.
- [ ] Focus visible: `:focus-visible { outline: 2px solid var(--color-accent-400); outline-offset: 2px; }`.

**Deps**: T-06, T-07.

---

### T-09 — `src/styles/motion.css` con vars + reduced-motion único · S

**Hace**: variables de duración y easing del design §2.6, único bloque `@media (prefers-reduced-motion: reduce)` que las colapsa a `0.01ms` y `0px`.

**Archivos**: `src/styles/motion.css`.

**Done**:
- [ ] `--motion-duration-{instant,fast,base,slow,page}` definidos.
- [ ] `--motion-ease-{out,in,in-out}` con cubic-bezier de DESIGN.md.
- [ ] `--motion-distance-{sm,md}` definidos.
- [ ] Único `@media (prefers-reduced-motion: reduce)` que sobreescribe TODAS las vars.
- [ ] Importado desde `global.css` con `@import './motion.css';`.

**Deps**: T-08.

---

### T-10 — `src/styles/prose.css` con overrides typography para MDX · M

**Hace**: clase `.prose` o `@layer` que aplica estilos custom a contenido MDX (h2/h3 con Fraunces, body Inter 16px line-height 1.7, code/pre con JetBrains Mono + bg `--bg-1`, blockquote, links con underline animado, listas).

**Archivos**: `src/styles/prose.css`.

**Done**:
- [ ] `.prose h1, .prose h2, .prose h3` usan `var(--font-display)` peso 600.
- [ ] `.prose code` (inline) tiene padding + bg `--bg-1` + font mono.
- [ ] `.prose pre` (Shiki blocks) tiene scroll-x, padding, bg `--bg-1`, border 1px `--border`.
- [ ] `.prose a` underline + hover color `--accent-300`.
- [ ] `.prose blockquote` con border-left 3px `--accent-500`.
- [ ] Importado desde `global.css`.

**Deps**: T-08.

---

### T-11 — Validación visual del sistema de diseño · S

**Hace**: arranca `npm run dev`, crea una página temporal `src/pages/_design-check.astro` con muestras de tipografía, paleta, gradientes y motion. Verifica visualmente. Borra la página al terminar.

**Archivos**: temporalmente `src/pages/_design-check.astro` (no commitear, eliminar al terminar).

**Done**:
- [ ] Dev server arranca sin errores.
- [ ] Body fondo es `#0a0a0f`.
- [ ] H1 con Fraunces se renderiza (no Times fallback).
- [ ] `--gradient-hero-ambient` visible en muestra.
- [ ] No hay FOUC al recargar.
- [ ] DevTools muestra Tailwind v4 funcionando.

**Deps**: T-08, T-09, T-10.

---

## Fase C — i18n (3 tareas)

### T-12 — `src/i18n/ui.ts` — diccionarios ES/EN · M

**Hace**: objeto `ui` con keys para strings UI compartidos: nav (home, work, blog, experience, contact), footer (built with, copyright, rss), form labels, status badges, 404, common verbs.

**Archivos**: `src/i18n/ui.ts`.

**Done**:
- [ ] Objeto exportado con shape `{ es: { ... }, en: { ... } }`.
- [ ] Cubre: `nav.{home,work,blog,experience,contact}`, `footer.{builtWith,copyright,rss}`, `form.{name,email,message,send,sending,success,error}`, `status.{success,inDevelopment,sideProject,paused,prevExperience}`, `common.{readMore,backTo,viewProject,viewCaseStudy}`.
- [ ] Tipo `UIDictionary` derivado y exportado.

**Deps**: ninguna.

---

### T-13 — `src/i18n/{routes.ts,helpers.ts}` — mapping rutas + helpers · M

**Hace**: `routes.ts` mapea ES↔EN (`/trabajos` ↔ `/work`, `/proyectos/[slug]` ↔ `/projects/[slug]`, `/experiencia` ↔ `/experience`, `/blog` ↔ `/blog`, `/contacto` ↔ `/contact`). `helpers.ts` exporta `getLangFromUrl(url)`, `useTranslations(lang)`, `getAlternateUrl(currentPath, currentLang, targetLang)`, `localePath(path, lang)`.

**Archivos**: `src/i18n/routes.ts`, `src/i18n/helpers.ts`.

**Done**:
- [ ] `getLangFromUrl(url)` devuelve `'es'` por default, `'en'` si path empieza por `/en`.
- [ ] `useTranslations(lang)` devuelve función `t(key)` que resuelve dot-paths del diccionario.
- [ ] `getAlternateUrl` devuelve null si la ruta destino no tiene equivalente declarada.
- [ ] `localePath(path, lang)` añade `/en` si lang=en y la ruta no lo tiene ya.

**Deps**: T-12.

---

### T-14 — `src/lib/content.ts` — helpers de collections con fallback · M

**Hace**: helpers tipados que envuelven `getCollection` filtrando por idioma, con fallback a ES si EN está vacío. Helpers: `getCaseStudies(lang)`, `getProjects(lang)`, `getExperience(lang)`, `getPosts(lang)`, `getEntryWithFallback(collection, slug, lang)`, `filterByStatus(entries, status)`.

**Archivos**: `src/lib/content.ts`.

**Done**:
- [ ] Cada helper retorna `Promise<CollectionEntry<...>[]>` ordenado por `featured` desc → `order` asc → `year` desc.
- [ ] `getEntryWithFallback` busca primero en idioma actual; si no encuentra, en ES; si tampoco, lanza.
- [ ] Excluye `draft: true` cuando `import.meta.env.PROD === true`.
- [ ] Tipos exportados para consumidores: `CaseStudyEntry`, `ProjectEntry`, etc.

**Deps**: T-15 (esquemas Zod).

---

## Fase D — Content collections (1 tarea)

### T-15 — `src/content/config.ts` con Zod schemas + estructura de carpetas · L

**Hace**: define las 4 colecciones con sus Zod schemas según design §Apéndice. Crea las carpetas `src/content/{case-studies,projects,experience,posts}/{es,en}` (con `.gitkeep`).

**Archivos**: `src/content/config.ts`, `src/content/case-studies/{es,en}/.gitkeep`, `src/content/projects/{es,en}/.gitkeep`, `src/content/experience/{es,en}/.gitkeep`, `src/content/posts/{es,en}/.gitkeep`.

**Done**:
- [ ] `case-studies` schema: title, tagline, client, year, role, stack[], results[]?, metrics[]?, status (literal `success`), featured, publishedAt?.
- [ ] `projects` schema: title, pitch, stack[], status (`in-development`|`side-project`|`paused`), links[]?, year?.
- [ ] `experience` schema: company, period, role, summary, stack[]?.
- [ ] `posts` schema: title, description, publishedAt (date), tags[], draft, canonical?.
- [ ] `collections` exportado con las 4 keys.
- [ ] `astro check` pasa.

**Deps**: T-04.

---

## Fase E — Layouts y componentes base (12 tareas)

### T-16 — `BaseLayout.astro` + `SeoHead.astro` + `SkipLink.astro` · L

**Hace**: BaseLayout root con `<html lang>`, SeoHead (canonical, hreflang alternates, og, twitter, JSON-LD Person para home), SkipLink (a11y), View Transitions con `<ClientRouter />` de `astro:transitions`. Importa `global.css` + `motion.css`. Preload de Fraunces 600 + Inter 400.

**Archivos**: `src/layouts/BaseLayout.astro`, `src/components/layout/SeoHead.astro`, `src/components/layout/SkipLink.astro`.

**Done**:
- [ ] BaseLayout recibe props: `title`, `description`, `lang`, `slug?`, `ogImage?`, `noIndex?`, `type?`.
- [ ] `<html lang={lang}>` correcto.
- [ ] `<link rel="preload" as="font" type="font/woff2" crossorigin>` para Fraunces 600 e Inter 400.
- [ ] SeoHead emite: canonical, hreflang ES + EN + x-default, og:title/description/url/image/type/locale, twitter:card summary_large_image, JSON-LD Person en home (basado en `type`).
- [ ] SkipLink visible solo en focus, salta a `#main`.
- [ ] `<ClientRouter />` montado.

**Deps**: T-08, T-09, T-13.

---

### T-17 — `Header.astro` con nav + LangSwitcher · M

**Hace**: header sticky-top con logo "marmibas" wordmark (Fraunces 600), nav (links a work/blog/experience/contact según lang), LangSwitcher (ver T-19) en el extremo derecho. Mobile: nav colapsable accesible.

**Archivos**: `src/components/layout/Header.astro`.

**Done**:
- [ ] Logo es link a `/` (es) o `/en` (en).
- [ ] Nav muestra labels traducidas vía `t('nav.*')`.
- [ ] Link activo tiene `aria-current="page"` y subrayado morado.
- [ ] En mobile (<768px), nav colapsa con botón hamburger accesible (aria-expanded).
- [ ] LangSwitcher renderizado como prop child.

**Deps**: T-13, T-19.

---

### T-18 — `Footer.astro` · S

**Hace**: footer con links sociales (GitHub `shacrom`, LinkedIn opcional, X/Twitter opcional), link a RSS, copyright dinámico (año actual), texto "Hecho con Astro".

**Archivos**: `src/components/layout/Footer.astro`.

**Done**:
- [ ] Año copyright dinámico: `new Date().getFullYear()`.
- [ ] Link RSS apunta a `/rss.xml` (o `/en/rss.xml` según lang).
- [ ] Link GitHub apunta a `https://github.com/shacrom`.
- [ ] Strings traducidos vía `t('footer.*')`.
- [ ] Sin sticky; al pie del documento.

**Deps**: T-13.

---

### T-19 — `LangSwitcher.astro` · M

**Hace**: dos chips (ES / EN) con JetBrains Mono. Usa `getAlternateUrl(currentPath, currentLang, targetLang)` para mantener path equivalente. Si la ruta destino no tiene equivalente, navega al `/` o `/en`. Activo: `aria-current="true"`, color `--accent-400`, underline.

**Archivos**: `src/components/layout/LangSwitcher.astro`.

**Done**:
- [ ] Props: `currentLang`, `currentPath`.
- [ ] Activo tiene `aria-current="true"` y estilo distinto (subrayado morado).
- [ ] Click navega a la ruta alternativa correcta.
- [ ] Si `getAlternateUrl` retorna null, link cae a index del idioma destino.
- [ ] Hover/focus 150ms transition.
- [ ] Accesible con teclado (Tab, Enter).

**Deps**: T-13.

---

### T-20 — `Reveal.astro` (IntersectionObserver utility) · M

**Hace**: wrapper genérico con IntersectionObserver del design §7. Props: `delay`, `distance`, `once`, `as`. Animación CSS con vars motion (no JS para la transición). Re-observación en `astro:page-load` para View Transitions.

**Archivos**: `src/components/ui/Reveal.astro`.

**Done**:
- [ ] Props: `delay = 0`, `distance = 'md'`, `once = true`, `as = 'div'`.
- [ ] Threshold 0.15, rootMargin `0px 0px -50px 0px`.
- [ ] Aplica clase `is-visible` al intersectar.
- [ ] Si `once`, desuscribe del observer tras primera intersección.
- [ ] Listener `astro:page-load` re-observa nuevos `.reveal:not(.is-visible)`.
- [ ] SSR fallback: si JS deshabilitado, elemento debe ser visible (no oculto permanente). Aplicar `.is-visible` por default y CSS lo controla.
- [ ] Respeta `prefers-reduced-motion` (controlado por motion.css vars).

**Deps**: T-09.

---

### T-21 — `ProjectCard.astro` · M

**Hace**: card normal de grid de project. Props: `project: CollectionEntry<'projects'>`, `lang`. Title (Fraunces), pitch (Inter), stack chips (TechBadge), status pill, link a `/proyectos/[slug]` o equivalente EN. Hover: border `--accent-400`, translateY(-2px), 150ms.

**Archivos**: `src/components/ui/ProjectCard.astro`.

**Done**:
- [ ] Border sólido `--border`, hover cambia a `--accent-400`.
- [ ] Status pill renderizada con color correspondiente (T-25).
- [ ] Stack chips usan TechBadge (T-25).
- [ ] Link al detalle del proyecto.
- [ ] `transition:name={`project-${slug}`}` para View Transitions.

**Deps**: T-15, T-25.

---

### T-22 — `CaseStudyCard.astro` · M

**Hace**: card destacado más alto con featured projects. Border conic gradient sutil que rota en hover (no idle). Title Fraunces 25px. Stack badges JetBrains Mono. Status pill arriba derecha.

**Archivos**: `src/components/ui/CaseStudyCard.astro`.

**Done**:
- [ ] Border usa `--gradient-border-featured` (conic).
- [ ] Background `--bg-1`.
- [ ] Hover rota el gradient (animación CSS, ~3s ease).
- [ ] Status pill posicionada absolute top-right.
- [ ] Link al case study.
- [ ] Respeta reduced-motion.

**Deps**: T-15, T-25.

---

### T-23 — `CaseStudyHero.astro` · M

**Hace**: hero de página case study. Título Fraunces opsz 144 peso 600 line-height 1, color `--text-0`. Eyebrow JetBrains Mono uppercase tracking 0.1em `--accent-400`. Subhead Inter 18-20px `--text-2`. Meta (cliente, año, role, stack chips). Background con `--gradient-hero-ambient` sutil.

**Archivos**: `src/components/ui/CaseStudyHero.astro`.

**Done**:
- [ ] Props: `title`, `tagline`, `client`, `year`, `role`, `stack: string[]`, `eyebrow?`.
- [ ] H1 con Fraunces opsz alto.
- [ ] Stack como TechBadges.
- [ ] Background con radial gradient ambient.
- [ ] `transition:name={`hero-${slug}`}`.

**Deps**: T-25.

---

### T-24 — `TableOfContents.astro` · M

**Hace**: TOC sticky lateral en breakpoint ≥lg. Recibe headings (depth, slug, text) extraídos del MDX. Scroll-spy mínimo (highlight de heading activo).

**Archivos**: `src/components/ui/TableOfContents.astro`.

**Done**:
- [ ] Props: `headings: { depth: number, slug: string, text: string }[]`, `lang`.
- [ ] Solo visible en ≥lg (Tailwind `hidden lg:block`).
- [ ] Sticky con `top: 96px`.
- [ ] Lista `<ul>` con anchor links a `#slug`.
- [ ] Scroll-spy: `IntersectionObserver` añade clase `is-current` al heading visible.
- [ ] Indentación visual según `depth` (h2 indent 0, h3 indent 16px).

**Deps**: T-09.

---

### T-25 — `TechBadge.astro` + `Pill.astro` (status) · S

**Hace**: dos componentes simples. TechBadge: chip JetBrains Mono 12px sobre `--accent-100` opacity 0.1, padding 4px 8px. Pill: badge para status proyecto, color según `status` (success morado / in-development terracotta / paused gris / prev-experience neutral).

**Archivos**: `src/components/ui/TechBadge.astro`, `src/components/ui/Pill.astro`.

**Done**:
- [ ] TechBadge props: `label`, `variant?: 'default'|'subtle'`.
- [ ] Pill props: `status: 'success'|'in-development'|'side-project'|'paused'|'prev-experience'`, `lang`.
- [ ] Pill aplica color de fondo + texto según `--color-status-*`.
- [ ] Pill etiqueta traducida vía `t('status.*')`.

**Deps**: T-12, T-13.

---

### T-26 — `Callout.astro` (MDX) + `MetricsGrid.astro` + `Prose.astro` · M

**Hace**: 3 componentes auxiliares. Callout: nota/warning/insight/success con icon Lucide + slot. MetricsGrid: grid de KPIs con `items: {label, value, sublabel?}[]`. Prose: wrapper que aplica `.prose` con overrides de `prose.css`.

**Archivos**: `src/components/ui/Callout.astro`, `src/components/ui/MetricsGrid.astro`, `src/components/ui/Prose.astro`.

**Done**:
- [ ] Callout props: `type: 'note'|'warn'|'insight'|'success'`, slot.
- [ ] Callout con border-left 3px del color del type.
- [ ] MetricsGrid renderiza grid responsive (1 col mobile, 3-4 desktop).
- [ ] MetricsGrid value en Fraunces grande, label en JetBrains Mono small.
- [ ] Prose es wrapper `<div class="prose">` con slot.

**Deps**: T-10.

---

### T-27 — `CaseStudyLayout.astro` + `PostLayout.astro` + `ProjectDetailLayout.astro` · L

**Hace**: 3 layouts que extienden BaseLayout. CaseStudyLayout: hero + grid 2col (content + TOC sticky) + MetricsGrid opcional + Prose. PostLayout: hero compacto + TOC + Prose + posts relacionados. ProjectDetailLayout: hero compacto + Prose + links externos.

**Archivos**: `src/layouts/CaseStudyLayout.astro`, `src/layouts/PostLayout.astro`, `src/layouts/ProjectDetailLayout.astro`.

**Done**:
- [ ] Cada layout extiende BaseLayout con `<BaseLayout>` import.
- [ ] CaseStudyLayout incluye CaseStudyHero + TableOfContents + Prose + MetricsGrid (si frontmatter `metrics`).
- [ ] PostLayout incluye fecha, reading time, TOC, Prose.
- [ ] ProjectDetailLayout es más simple: hero + Prose + links.
- [ ] Cada uno inyecta meta correcto (type article/website, JSON-LD apropiado).
- [ ] Reading time calculado vía helper.

**Deps**: T-16, T-23, T-24, T-26.

---

## Fase F — Componentes home (5 tareas)

### T-28 — `HeroIntro.astro` (cascada palabras escalonada) · M

**Hace**: componente del design §7 con cascade animation. Props: `lines: string[]`, `caretAfter?: boolean`. Cada línea tiene `--line-index` y CSS animation con delay calc. Total ≤400ms. Caret blinking opcional.

**Archivos**: `src/components/ui/HeroIntro.astro`.

**Done**:
- [ ] Cada línea es `<span>` con `style="--line-index: i"`.
- [ ] Animation `hero-line-in` 250ms ease-out, delay `calc(var(--line-index) * 120ms)`.
- [ ] Caret blinking opcional con `animation: caret-blink 1.1s steps(2)`.
- [ ] Reduced motion: animation none, opacity 1, transform none.
- [ ] Fraunces opsz 144 weight 600.

**Deps**: T-08, T-09.

---

### T-29 — `home/Hero.astro` (compone HeroIntro + tagline + CTAs) · M

**Hace**: sección hero del home. Compone HeroIntro con líneas localizadas, subhead, CTA primario "Hablemos" → /contacto, CTA secundario "Ver trabajos" → /trabajos. Background con `--gradient-hero-ambient`.

**Archivos**: `src/components/home/Hero.astro`.

**Done**:
- [ ] Líneas hero traducidas: ES "Construyo software / que tu negocio / necesita." (3 líneas), EN equivalente.
- [ ] CTA primario con `--gradient-cta` + glow shadow en focus.
- [ ] Background radial gradient ambient.
- [ ] Padding vertical generoso (128px desktop / 64px mobile).
- [ ] Eyebrow opcional "Ingeniero Informático · Full Stack".

**Deps**: T-28.

---

### T-30 — `home/About.astro` + `home/Skills.astro` · M

**Hace**: About es párrafo en primera persona con credencial "Ingeniero Informático" y mini-pitch para PYMEs (RF-04). Skills es stack agrupado por categoría (Frontend / Backend / Infra / Tooling) (RF-05).

**Archivos**: `src/components/home/About.astro`, `src/components/home/Skills.astro`.

**Done**:
- [ ] About contiene "Ingeniero Informático" en ES y "Software Engineer" en EN.
- [ ] About menciona PYMEs LATAM/ES y tipo de problemas (refactor, MVPs, integraciones).
- [ ] Skills agrupado: Frontend (Astro, Angular, React, Tailwind), Backend (NestJS, Spring Boot, Supabase, PostgreSQL), Infra (Vercel, Resend), Tooling (Playwright, Git/GitFlow).
- [ ] Skills usa TechBadge.
- [ ] Sin foto en v1.

**Deps**: T-25, T-12.

---

### T-31 — `home/FeaturedWork.astro` · M

**Hace**: sección "Trabajos seleccionados". Carga 2-3 entries con `featured: true`. Renderiza CaseStudyCard para case-studies y ProjectCard para projects. Link "Ver todos" al final.

**Archivos**: `src/components/home/FeaturedWork.astro`.

**Done**:
- [ ] Carga via `getCaseStudies(lang)` filtrado a `featured: true`, ordenado.
- [ ] Si <2 case-studies featured, completa con projects featured.
- [ ] Renderiza CaseStudyCard o ProjectCard según el tipo de entry.
- [ ] Link "Ver todos los trabajos" → `/trabajos` o `/en/work`.

**Deps**: T-14, T-21, T-22.

---

### T-32 — `home/ContactSection.astro` + `interactive/ContactForm.astro` · L

**Hace**: ContactSection es la sección final del home con título + ContactForm embebido (o link a `/contacto`). ContactForm es la island interactiva: estados idle/sending/success/error, fetch a `/api/contact`, validación cliente, honeypot field hidden.

**Archivos**: `src/components/home/ContactSection.astro`, `src/components/interactive/ContactForm.astro`.

**Done**:
- [ ] ContactForm con `client:visible` directive.
- [ ] Campos: name (min 2), email (valid), message (min 10 max 2000), website (honeypot, hidden, esperado vacío).
- [ ] Estados visuales: idle → sending (botón disabled + spinner) → success (mensaje localizado) → error (genérico).
- [ ] Fetch POST a `/api/contact` con JSON, handle 400 (validation), 429 (rate limit), 500 (server).
- [ ] Validación cliente HTML5 + parse Zod opcional antes de submit.
- [ ] Reset form en success.
- [ ] Labels accesibles, aria-live para mensajes de estado.

**Deps**: T-12, T-41 (endpoint contacto).

---

## Fase G — Páginas (10 tareas)

### T-33 — `pages/index.astro` + `pages/en/index.astro` · M

**Hace**: home en ES y EN. Componen Hero + About + Skills + FeaturedWork + ContactSection dentro de BaseLayout. Cada uno pasa `lang` correcto. Title y description SEO específicos.

**Archivos**: `src/pages/index.astro`, `src/pages/en/index.astro`.

**Done**:
- [ ] ES: title "marmibas — Ingeniero Informático & Full Stack Developer", description bilingüe localizada.
- [ ] EN: equivalente.
- [ ] Layout: BaseLayout con `lang` correcto, secciones envueltas en `<Reveal>` cuando aporta valor.
- [ ] JSON-LD Person inyectado.

**Deps**: T-16, T-29, T-30, T-31, T-32.

---

### T-34 — `pages/trabajos/index.astro` + `pages/en/work/index.astro` (grid + filtros) · L

**Hace**: grid filtrable por status (success/in-development/side-project/prev-experience) y tags (stack). Filtros sticky arriba. URL state `?status=...&tag=...`. Sin JS funciona vía form GET; con JS aplica client-side. Renderiza CaseStudyCard o ProjectCard según entry.

**Archivos**: `src/pages/trabajos/index.astro`, `src/pages/en/work/index.astro`.

**Done**:
- [ ] Carga case-studies + projects + experience entries del idioma.
- [ ] Filtros con radio (status) + checkboxes (tags) + label accesibles.
- [ ] Estado en URL: `?status=success&tag=astro`.
- [ ] Sin JS: form GET filtra al submit; con JS: filtra inline sin recargar.
- [ ] Mensaje "No hay proyectos que coincidan" + link "Ver todos" si vacío.
- [ ] Layout responsive: 12 col desktop, 6 tablet, 1 mobile.

**Deps**: T-14, T-21, T-22.

---

### T-35 — `pages/trabajos/[slug].astro` + `pages/en/work/[slug].astro` (resolver case-study | project) · L

**Hace**: página de detalle. `getStaticPaths` que enumera case-studies + projects + experience. En el render, decide layout: CaseStudyLayout para case-studies, ProjectDetailLayout para projects, layout custom para experience entries (con disclaimer RF-13). Slug único cross-collection.

**Archivos**: `src/pages/trabajos/[slug].astro`, `src/pages/en/work/[slug].astro`.

**Done**:
- [ ] `getStaticPaths` devuelve entries de case-studies + projects + experience del idioma.
- [ ] Resolución por slug primero en case-studies, luego en projects, luego en experience.
- [ ] Layout switch automático según colección encontrada.
- [ ] Experience entry incluye banner disclaimer "Trabajo realizado en X. No es proyecto propio".
- [ ] CI check (T-56) valida unicidad de slugs cross-collection.

**Deps**: T-14, T-27.

---

### T-36 — `pages/blog/index.astro` + `pages/en/blog/index.astro` · M

**Hace**: lista cronológica desc de posts. Cada item: título, fecha (formato local), reading time, description. Excluye `draft: true` en producción. Mensaje "Aún no hay publicaciones" si vacío.

**Archivos**: `src/pages/blog/index.astro`, `src/pages/en/blog/index.astro`.

**Done**:
- [ ] Carga via `getPosts(lang)` filtrando draft.
- [ ] Ordenado por `publishedAt` desc.
- [ ] Cada card muestra reading time calculado.
- [ ] Fecha en formato local: ES `7 de mayo de 2026`, EN `May 7, 2026`.
- [ ] Estado vacío con mensaje localizado.

**Deps**: T-14.

---

### T-37 — `pages/blog/[slug].astro` + `pages/en/blog/[slug].astro` · M

**Hace**: post individual. Usa PostLayout. Inyecta TOC desde headings extraídos. Renderiza MDX con Shiki. Prev/next post navigation.

**Archivos**: `src/pages/blog/[slug].astro`, `src/pages/en/blog/[slug].astro`.

**Done**:
- [ ] `getStaticPaths` enumera posts del idioma.
- [ ] Headings extraídos vía `entry.headings` (Astro provee).
- [ ] PostLayout aplicado.
- [ ] Prev/next basado en orden cronológico.
- [ ] JSON-LD `BlogPosting`.
- [ ] Canonical correcto.

**Deps**: T-14, T-27.

---

### T-38 — `pages/experiencia/index.astro` + `pages/en/experience/index.astro` (timeline) · M

**Hace**: timeline cronológico inverso de experiencia profesional. Lista cards: Capgemini Full Stack (Mar 2023-Jul 2024), Capgemini Back-End (Nov 2022-Feb 2023), Cleverpy ML Back-End (Feb-May 2022), Cleverpy ML Front-End (Sept-Dic 2021), Devoltec MES (Jul 2024-Mar 2026). Educación abajo: Grado Ingeniería Informática · ETSE Universidad de Valencia · 2018-2023.

**Archivos**: `src/pages/experiencia/index.astro`, `src/pages/en/experience/index.astro`.

**Done**:
- [ ] Timeline visual con línea vertical + nodos.
- [ ] Carga entries de `experience` collection.
- [ ] Devoltec aparece arriba (reverse-chrono) con fechas Jul 2024 - Mar 2026.
- [ ] Educación renderizada como sección separada al final.
- [ ] Sin disclaimer en Capgemini ni Cleverpy (son entradas normales de empleo).

**Deps**: T-14.

---

### T-39 — `pages/contacto.astro` + `pages/en/contact.astro` · M

**Hace**: página dedicada a contacto. Hero compacto con tagline tipo "Hablemos sobre tu proyecto". ContactForm grande. Disponibilidad mostrada como "Disponible para nuevos proyectos" (genérico, sin plazos).

**Archivos**: `src/pages/contacto.astro`, `src/pages/en/contact.astro`.

**Done**:
- [ ] Hero con título Fraunces.
- [ ] Texto "Disponible para nuevos proyectos" prominente.
- [ ] ContactForm embebido grande.
- [ ] Email alternativo visible: `marmibas.dev@gmail.com` con click-to-copy o mailto.

**Deps**: T-32.

---

### T-40 — `pages/404.astro` + `pages/en/404.astro` · S

**Hace**: 404 bilingüe. Detecta idioma del path (`/en/...` → EN, resto → ES). Mensaje claro, link al home y al índice de proyectos.

**Archivos**: `src/pages/404.astro`, `src/pages/en/404.astro`.

**Done**:
- [ ] ES: "Esta página no existe", links a `/` y `/trabajos`.
- [ ] EN: "Page not found", links a `/en` y `/en/work`.
- [ ] Layout BaseLayout aplicado.
- [ ] No indexable (`<meta name="robots" content="noindex">`).

**Deps**: T-16.

---

## Fase H — API endpoint (1 tarea)

### T-41 — `src/pages/api/contact.ts` · L

**Hace**: endpoint POST del design §6. Stack: Astro endpoint + Zod + Resend. Honeypot 200 silencioso, rate-limit en memoria por IP (5 req / 10 min), `prerender: false`. From: `marmibas.dev <hola@marmibas.dev>`. ReplyTo: email del usuario. Subject localizado.

**Archivos**: `src/pages/api/contact.ts`.

**Done**:
- [ ] `prerender = false`.
- [ ] Schema Zod estricto: name 2-120, email valid 254, message 10-2000 trimmed, website max 0 (honeypot), lang enum.
- [ ] Honeypot rellenado → response 200 silencioso (no envía).
- [ ] Rate-limit en memoria con Map por IP.
- [ ] Resend SDK envía email plain text.
- [ ] No loggea contenido del mensaje (solo IP + lang en errores).
- [ ] Códigos HTTP correctos: 200 ok, 400 validation, 429 rate, 500 send_failed.

**Deps**: T-02 (resend instalado), T-15.

---

## Fase I — Contenido inicial (8 tareas)

### T-42 — `case-studies/es/voxye.mdx` · L

**Hace**: case study principal de Voxye. Frontmatter completo + body MDX. Estructura: pitch ("SaaS multi-tenant para reformistas — del presupuesto al cobro, sin Word ni Excel"), problema, solución, stack canónico (Angular 21, Tailwind 4, PrimeNG, PDFMake, Supabase RLS, Edge Functions Deno, Resend webhooks, Vercel), 5 decisiones técnicas destacables (PDF multi-tenant, webhooks idempotentes, numeración configurable con templates, RLS multi-tenant testeado por PR, document state machines), MetricsGrid opcional (24 tablas multi-tenant, 9 asserts SQL por PR, 18 Edge Functions).

**Archivos**: `src/content/case-studies/es/voxye.mdx`.

**Done**:
- [ ] Frontmatter: title, tagline, client (puede ser "Cliente confidencial · sector reformas"), year (2025-2026), role ("Full Stack Developer"), stack[], status `success`, featured `true`, order 1.
- [ ] Tagline canónico aplicado.
- [ ] Stack: Angular 21, TypeScript, Tailwind v4, PrimeNG, PDFMake, Supabase, Resend, Vercel, Playwright.
- [ ] 5 decisiones técnicas narradas en prosa (no listas de tabla).
- [ ] Body MDX usa `<Callout>` para insights.

**Deps**: T-15, T-26.

---

### T-43 — `case-studies/es/recetas-novatex.mdx` · M

**Hace**: case study Recetas Novatex. Pitch: "Libreta digital de parámetros para máquinas RAMs textiles". Problema: pérdida de libretas físicas, transmisión generacional fallida. Solución: búsqueda cliente → artículo → parámetros (temperatura, velocidad). Stack: Angular, Supabase, Tailwind, PostgreSQL.

**Archivos**: `src/content/case-studies/es/recetas-novatex.mdx`.

**Done**:
- [ ] Frontmatter: status `success`, featured `true` o `false` según estrategia.
- [ ] Body cubre problema (libretas físicas, jubilaciones), solución (búsqueda cliente/artículo), stack.
- [ ] Sin métricas de cliente real (no hay datos provistos).

**Deps**: T-15.

---

### T-44 — `case-studies/en/voxye.mdx` · M

**Hace**: traducción al inglés de T-42. Mismo frontmatter pero en EN, mismo body MDX traducido manteniendo terminología técnica.

**Archivos**: `src/content/case-studies/en/voxye.mdx`.

**Done**:
- [ ] Tagline EN: "Multi-tenant SaaS for renovation contractors — from quote to payment, without Word or Excel".
- [ ] Body traducido conservando términos técnicos (RLS, Edge Functions, etc.).
- [ ] Frontmatter en EN con mismas keys que ES.

**Deps**: T-42.

---

### T-45 — `projects/es/jinba.mdx` + `projects/es/acompana.mdx` · M

**Hace**: dos entradas de projects en desarrollo. Jinba: hub de info de coches usados para no expertos. Acompaña: app móvil para coordinadores Renfe (turnos, calendario, vacaciones, fichajes), reemplaza WhatsApp.

**Archivos**: `src/content/projects/es/jinba.mdx`, `src/content/projects/es/acompana.mdx`.

**Done**:
- [ ] Jinba: status `in-development`, stack [Astro, TypeScript, Supabase], pitch + problema corto.
- [ ] Acompaña: status `in-development`, stack [Angular, Supabase, mobile-first], pitch + problema (turnos por WhatsApp sin lectura confirmada).
- [ ] Frontmatter completo y válido contra schema.

**Deps**: T-15.

---

### T-46 — `projects/es/feed-me.mdx` + `projects/es/puro-padel.mdx` · M

**Hace**: dos side projects pausados. Feed Me: tipo Wetaca/HelloFresh para amigo en industria culinaria. Puro Padel: gestión clientes/citas/pistas para empresa de padel, hecho con amigos.

**Archivos**: `src/content/projects/es/feed-me.mdx`, `src/content/projects/es/puro-padel.mdx`.

**Done**:
- [ ] Ambos status `paused` o `side-project` según schema final.
- [ ] Cada uno con pitch corto + contexto + estado (pausado).
- [ ] Sin maquillar el estado: badge claro "Pausado".

**Deps**: T-15.

---

### T-47 — `experience/es/{capgemini-fullstack,capgemini-backend,cleverpy-frontend,cleverpy-backend}.md` · M

**Hace**: 4 entradas de experience del CV. Cada una: company, period, role, summary (bullets de stack y responsabilidades).

**Archivos**:
- `src/content/experience/es/capgemini-fullstack.md`
- `src/content/experience/es/capgemini-backend.md`
- `src/content/experience/es/cleverpy-frontend.md`
- `src/content/experience/es/cleverpy-backend.md`

**Done**:
- [ ] Capgemini Full Stack: Mar 2023 - Jul 2024, microservicios hexagonales Spring Boot + Angular + tests unitarios.
- [ ] Capgemini Back-End: Nov 2022 - Feb 2023, BBDD relacional + microservicios Spring Boot.
- [ ] Cleverpy Front-End: Sept 2021 - Dic 2021, React + Redux + API REST + JWT + Sass + Git/GitFlow.
- [ ] Cleverpy Back-End: Feb 2022 - May 2022, Python→Java + Java Spring + PostgreSQL + Git/GitFlow.
- [ ] Frontmatter válido contra schema.

**Deps**: T-15.

---

### T-48 — `experience/es/devoltec-mes.md` · M

**Hace**: entrada Devoltec MES. Period: Jul 2024 - Mar 2026. Role: Full Stack / industrial. Summary: programa MES genérico (gestión procesos en fábricas — bolsas, señales, etc.), órdenes con procesos, asignación a máquinas con materias primas, sensores en tiempo real, control operarios y materias primas.

**Archivos**: `src/content/experience/es/devoltec-mes.md`.

**Done**:
- [ ] Period exacto: "Jul. 2024 — Mar. 2026".
- [ ] Company: "Devoltec".
- [ ] Summary cubre: cargar órdenes, procesos, máquinas + materias primas, sensores tiempo real, control operarios/materias.
- [ ] Sin disclaimer especial (decisión actualizada: es entrada normal de empleo).

**Deps**: T-15.

---

### T-49 — `experience/en/*.md` (paridad parcial) · M

**Hace**: traducción ligera de las entradas de experience más relevantes a EN. Mínimo: Devoltec MES + Capgemini Full Stack. Resto puede degradar a ES vía fallback.

**Archivos**: `src/content/experience/en/devoltec-mes.md`, `src/content/experience/en/capgemini-fullstack.md`.

**Done**:
- [ ] Devoltec MES en EN con mismo period y summary traducido.
- [ ] Capgemini Full Stack en EN.
- [ ] Resto NO traducido (acepta fallback).

**Deps**: T-47, T-48.

---

## Fase J — SEO + analytics (4 tareas)

### T-50 — `@astrojs/sitemap` config + structured data JSON-LD en SeoHead · M

**Hace**: completa config sitemap en `astro.config.mjs` con i18n locales y customPages si aplica. SeoHead inyecta JSON-LD según tipo: Person en home, Article en posts, CreativeWork en case studies.

**Archivos**: `astro.config.mjs` (update), `src/components/layout/SeoHead.astro` (update T-16).

**Done**:
- [ ] Sitemap genera `/sitemap-index.xml` y `/sitemap-0.xml`.
- [ ] hreflang automático para entries con paridad ES↔EN.
- [ ] SeoHead emite JSON-LD condicional según prop `type`.
- [ ] JSON-LD Person en home con `name`, `url`, `jobTitle`, `alumniOf` (ETSE Universidad de Valencia).

**Deps**: T-16, T-03.

---

### T-51 — `public/robots.txt` + `public/favicon.svg` + `public/og/default.png` · S

**Hace**: robots.txt allow all + sitemap reference. Favicon SVG simple con wordmark "m" o iniciales. OG image default placeholder 1200x630.

**Archivos**: `public/robots.txt`, `public/favicon.svg`, `public/og/default.png`.

**Done**:
- [ ] `robots.txt` con `User-agent: *`, `Allow: /`, `Sitemap: https://marmibas.dev/sitemap-index.xml`.
- [ ] `favicon.svg` con wordmark monocromo.
- [ ] OG default 1200x630 con título "marmibas.dev" y paleta del sitio.

**Deps**: ninguna.

---

### T-52 — `src/pages/rss.xml.ts` (RSS bilingüe del blog) · M

**Hace**: feed RSS del blog ES (default). EN puede tener `/en/rss.xml` adicional. Items: title, description, link, pubDate, content (excerpt).

**Archivos**: `src/pages/rss.xml.ts`, opcional `src/pages/en/rss.xml.ts`.

**Done**:
- [ ] Genera RSS válido (validador W3C pasa).
- [ ] Posts con `draft: true` excluidos.
- [ ] Ordenado por `publishedAt` desc.
- [ ] Link Footer (T-18) apunta al RSS correcto.

**Deps**: T-14, T-15.

---

### T-53 — Vercel Analytics integrado · S

**Hace**: ya configurado en T-03 vía `webAnalytics: { enabled: true }` en adapter. Verificar que el script se inyecta en producción y no en dev.

**Archivos**: ninguno (verificación).

**Done**:
- [ ] Build producción incluye script de `@vercel/analytics`.
- [ ] Dev local no incluye el script.
- [ ] Cookieless (DevTools confirma sin Set-Cookie).

**Deps**: T-03.

---

## Fase K — Tests + verify (3 tareas)

### T-54 — Vitest config + 2 unit tests del helper i18n · M

**Hace**: instala `vitest`, configura `vitest.config.ts` con preset Astro. Escribe 2 tests del helper i18n (T-13).

**Archivos**: `vitest.config.ts`, `src/i18n/helpers.test.ts`.

**Plan de tests** (prosa):

1. **`getLangFromUrl returns 'es' by default`**
   - Verifica: que rutas sin prefijo `/en` devuelven `'es'`.
   - Aserción: `getLangFromUrl(new URL('https://x/trabajos'))` === `'es'`.

2. **`getLangFromUrl returns 'en' for /en paths`**
   - Verifica: que rutas bajo `/en` devuelven `'en'`.
   - Aserción: `getLangFromUrl(new URL('https://x/en/blog/post-1'))` === `'en'`.

3. **`getAlternateUrl preserves equivalent path`**
   - Verifica: traducción `/trabajos` ↔ `/en/work`.
   - Aserción: `getAlternateUrl('/trabajos', 'es', 'en')` === `'/en/work'`.

4. **`getAlternateUrl falls back to lang index when no equivalent`**
   - Verifica: ruta sin equivalente declarada cae al index del idioma destino.
   - Aserción: `getAlternateUrl('/ruta-inventada', 'es', 'en')` === `'/en'`.

5. **`useTranslations resolves dot-paths`**
   - Verifica: que `t('nav.home')` retorna el string correcto del diccionario.
   - Aserción: `useTranslations('es')('nav.home')` === `'Inicio'`.

**Done**:
- [ ] `npm run test` corre vitest sin errores.
- [ ] 5 tests pasan.
- [ ] Coverage del helper i18n ≥80%.

**Deps**: T-13.

---

### T-55 — Test del Zod schema del form contacto · S

**Hace**: test que valida ContactSchema del endpoint con casos válidos e inválidos.

**Archivos**: `src/pages/api/contact.test.ts`.

**Plan de tests** (prosa):

1. **`accepts valid payload`**
   - Verifica: payload correcto con name, email, message dentro de límites pasa la validación.
   - Aserción: `ContactSchema.safeParse({...valid}).success` === `true`.

2. **`rejects email without @`**
   - Verifica: email malformado falla.
   - Aserción: `.success === false` y `error.flatten().fieldErrors.email` no vacío.

3. **`rejects message shorter than 10 chars`**
   - Verifica: mensaje muy corto falla.
   - Aserción: `.fieldErrors.message` contiene mensaje de min length.

4. **`accepts honeypot empty string`**
   - Verifica: `website: ''` (esperado) pasa.
   - Aserción: `.success === true`.

5. **`rejects honeypot filled (spam bot)`**
   - Verifica: `website: 'http://spam.com'` (max 0) falla la validación.
   - Aserción: `.success === false`.

**Done**:
- [ ] 5 tests pasan.
- [ ] Mocks de Resend si se prueba el handler completo (opcional v1).

**Deps**: T-41.

---

### T-56 — Smoke verify manual: Lighthouse + axe-core en home/Voxye/contacto · M

**Hace**: ejecuta lighthouse y axe-core localmente sobre build estático. Documenta resultados. Si <95, abre followups; no fail si está cerca y se documenta.

**Archivos**: `scripts/verify.sh` opcional, output guardado en `lighthouse-reports/`.

**Done**:
- [ ] Lighthouse home: perf, a11y, best-practices, SEO ≥95 cada uno.
- [ ] Lighthouse case-studies/voxye: ≥95.
- [ ] Lighthouse blog/post-test: ≥95 (si hay post; si no, omitir).
- [ ] axe-core CLI sobre las 3 páginas: 0 violations críticas.
- [ ] Navegación por teclado verificada manualmente: skip-link, switcher, form, focus visible.

**Deps**: todas las páginas (T-33 a T-40), T-50, T-53.

---

## Fase L — Vercel + dominio (3 tareas)

### T-57 — Vercel link + env vars · S

**Hace**: `vercel link` apunta el repo a un nuevo proyecto Vercel. Configura env vars `RESEND_API_KEY` (secret) y `CONTACT_TO_EMAIL` para production y preview.

**Archivos**: `.vercel/` (gitignored).

**Done**:
- [ ] Proyecto Vercel creado y linkado al repo `shacrom/marmibas.dev`.
- [ ] Env vars en Production y Preview: `RESEND_API_KEY`, `CONTACT_TO_EMAIL=marmibas.dev@gmail.com`.
- [ ] Framework auto-detect = Astro confirmado.

**Deps**: T-03 (config Astro lista para Vercel).

---

### T-58 — DNS marmibas.dev + SPF/DKIM/DMARC · M

**Hace**: en el registrar del dominio, configura A/CNAME hacia Vercel. Para Resend: añade los TXT de SPF, DKIM, DMARC iniciales (`p=none; rua=mailto:dmarc@marmibas.dev`). Verifica propagación con `dig` o herramientas online.

**Archivos**: ninguno en repo (config externa). Documentar en `README.md` o `docs/dns.md`.

**Done**:
- [ ] `marmibas.dev` resuelve a Vercel con HTTPS válido.
- [ ] `www.marmibas.dev` redirige a apex.
- [ ] Resend dashboard muestra dominio verificado.
- [ ] Test send a Gmail/iCloud personal pasa Authentication-Results.

**Deps**: T-57.

---

### T-59 — Verificar primer preview deploy + smoke E2E · M

**Hace**: hace push a una branch nueva, espera preview deploy, navega manualmente: home (ES + EN), 1 case study, lang switcher, form de contacto (envía mensaje real), 404. Documenta cualquier issue.

**Archivos**: ninguno (verificación).

**Done**:
- [ ] Preview deploy genera URL accesible.
- [ ] Home ES carga sin errores ni FOUC.
- [ ] Lang switcher cambia a EN sin perder ruta equivalente.
- [ ] Case study Voxye renderiza ES y EN.
- [ ] Form de contacto: envío real → email recibido en `marmibas.dev@gmail.com`.
- [ ] 404 bilingüe coherente.
- [ ] DevTools confirma View Transitions activas.
- [ ] Lighthouse en URL preview ≥95 (smoke).

**Deps**: todas las anteriores.

---

## Top 3 tareas más arriesgadas

1. **T-41 (`/api/contact`)** — más superficie de fallo: validación + honeypot + rate-limit + Resend SDK + DKIM/SPF DNS. Si falla, se pierde la única CTA real de captación. Mitigación: implementar paso a paso, testar honeypot y rate-limit antes de DNS, hacer send-test real antes de lanzar.

2. **T-34 (grid filtrable progressive enhancement)** — filtros que funcionen sin JS Y con JS, mantener URL state, accesibles. Tentación de complicar con state machines. Mitigación: empezar con form GET puro, añadir client-side encima si sobra tiempo.

3. **T-58 (DNS + SPF/DKIM/DMARC)** — propagación lenta, errores no obvios. Si falla, emails van a spam o bouncean. Mitigación: configurar Resend ANTES de envío real, monitorear con `dig` y dashboards, DMARC inicial `p=none` para no bloquear agresivamente.

---

## Sugerencia de batch inicial (paralelizable)

**Batch 1** (todo en paralelo, sin dependencias entre sí):
- T-01 (init package.json)
- T-07 (download fuentes)
- T-12 (i18n/ui.ts)
- T-15 (content/config.ts) ← bloquea muchas, prioridad

**Batch 2** (tras T-01, T-15):
- T-02 (deps Astro)
- T-04 (tsconfig + tooling)
- T-13 (i18n/routes + helpers)
- T-14 (lib/content)

**Batch 3** (tras T-02, T-08):
- T-03 (astro.config)
- T-08 (global.css con @theme)
- T-09 (motion.css)
- T-10 (prose.css)

**Batch 4** (tras todo lo anterior + T-16):
- Componentes UI en paralelo: T-20, T-21, T-22, T-23, T-24, T-25, T-26.

A partir de ahí, layouts y páginas en serie.

---

**Estado de TASKS.md**: generado por sub-agent sdd-tasks. Iterar libremente al ejecutar; reflejar cambios significativos en memoria via `mem_save` con topic_key `sdd/marmibas-dev-bootstrap/tasks`.
