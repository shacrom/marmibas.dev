# DESIGN.md — marmibas.dev

> **Estado**: borrador inicial. Documento vivo — se itera durante el proyecto.
> Última actualización: 2026-05-07.

## 1. Filosofía visual

**Tech minimal oscuro con identidad morada y degradados sutiles.**

Tres principios de diseño que mandan sobre todo lo demás:

1. **Oscuro primero, no dark mode añadido**. La estética nace dark; no hay tema claro en v1.
2. **Morado como firma**, no como decoración. El violeta solo aparece donde aporta jerarquía o personalidad: hero, CTAs, focus states, featured projects, status "en producción". Nunca en backgrounds planos ni en body text.
3. **Degradados con disciplina**. Sutiles, no neón. Aparecen únicamente en cuatro lugares (hero ambient, CTA hover, featured card border, transitions de página). En cualquier otro sitio, color sólido.

## 2. Paleta

### Base oscura (con tinte violeta muy sutil)

| Token | Hex | Uso |
|---|---|---|
| `--bg-0` | `#0d0a14` | Fondo principal de la página |
| `--bg-1` | `#12121a` | Cards, surfaces elevadas |
| `--bg-2` | `#1a1a26` | Modales, overlays, surfaces más elevadas |

### Texto

| Token | Hex | Uso |
|---|---|---|
| `--text-0` | `#fafafa` | Headings principales, foco máximo |
| `--text-1` | `#e8e8ee` | Body text |
| `--text-2` | `#a8a8b8` | Texto secundario, captions |
| `--text-3` | `#6a6a78` | Muted, metadata, placeholders |
| `--border` | `#252535` | Bordes sutiles, separadores |

### Acento morado (escala violet)

| Token | Hex | Uso |
|---|---|---|
| `--accent-100` | `#ede9fe` | Backgrounds de chips/badges sobre dark |
| `--accent-300` | `#c4b5fd` | Hover suave, highlights |
| `--accent-400` | `#a78bfa` | **Principal** — links, focus, status success |
| `--accent-500` | `#8b5cf6` | Hover/active de CTAs primarios |
| `--accent-600` | `#7c3aed` | Deep — gradient end, decoración |
| `--accent-700` | `#6d28d9` | Sombras, profundidad |
| `--accent-glow` | `rgba(139, 92, 246, 0.15)` | Radial glow para hero |

### Status (proyecto)

| Status | Color | Uso |
|---|---|---|
| Success / en producción | `var(--accent-400)` | Voxye, Recetas Novatex |
| En desarrollo | `#c9a892` (terracotta muted) | Jinba, Acompaña |
| Side project / pausado | `#71717a` (neutral) | Feed Me, Puro Padel |
| Experiencia previa | `var(--text-2)` | Capgemini, Cleverpy, Devoltec |

## 3. Degradados

### Política de uso

Permitido en:
- Hero ambient (radial sutil)
- CTA principal (linear)
- Border de featured project card (conic subtle)
- Algunos H seleccionados (text gradient vertical)
- Page transitions (View Transitions con fade gradient)

Prohibido en:
- Cards normales (border sólido)
- Navbar y footer (color sólido)
- Body text (siempre `--text-1`)
- Botones secundarios (outline + color sólido)

### Definiciones

```css
--gradient-hero-ambient: radial-gradient(
  ellipse at top,
  var(--accent-700) 0%,
  transparent 60%
);

--gradient-cta: linear-gradient(
  135deg,
  var(--accent-500) 0%,
  var(--accent-400) 100%
);

--gradient-cta-hover: linear-gradient(
  135deg,
  var(--accent-400) 0%,
  var(--accent-300) 100%
);

--gradient-text-display: linear-gradient(
  180deg,
  var(--text-0) 0%,
  var(--accent-300) 100%
);

--gradient-border-featured: conic-gradient(
  from 180deg at 50% 50%,
  var(--accent-600),
  var(--accent-400),
  var(--accent-600)
);
```

### Animación de degradados

Solo el CTA primario anima su degradado en hover (200ms ease-out shift).
Idle states son estáticos. No hay `background: linear-gradient(... animation: shift 4s)` en ningún sitio en v1.

`MidCta` (banda de transición entre secciones del home) se queda deliberadamente FUERA de este patrón: es un link inline (Geist Sans, color `--accent-400`), no un botón. Convertirlo en CTA con gradient añadiría otro CTA primario visible en la misma vista (home ya tiene el CTA del Hero), rompiendo la regla "un solo CTA primario por vista". Su hover sigue siendo color + underline, 150ms.

## 4. Tipografía

| Familia | Uso | Pesos | Fuente |
|---|---|---|---|
| **Geist Sans** (variable) | H1, H2, hero, display | 600 (preload), 700 | Self-hosted, axis wght 100..900 |
| **Inter** | body, nav, UI | 400 (preload), 500, 600 | Self-hosted |
| **JetBrains Mono** | code, small metadata, badges | 400 | Self-hosted |

### Escala

Base 16px. Ratio 1.25 (major third).

| Token | Tamaño | Uso |
|---|---|---|
| `--text-xs` | 12px | metadata, captions |
| `--text-sm` | 14px | secondary body |
| `--text-base` | 16px | body |
| `--text-lg` | 20px | lead paragraph |
| `--text-xl` | 25px | H4 |
| `--text-2xl` | 31px | H3 |
| `--text-3xl` | 39px | H2 |
| `--text-4xl` | 49px | H1 |
| `--text-display` | 72px+ (clamp) | Hero |

### Reglas

- Hero usa Geist Sans peso 600 para máximo carácter geométrico.
- Headings de sección usan Geist Sans 600.
- `code`, badges, version numbers, fechas usan JetBrains Mono.
- Body es Inter siempre. Geist Sans queda reservado a display.

## 5. Espaciado

Base 4px. Escala: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

Ritmo vertical generoso: secciones separan con 96-128px en desktop, 48-64px en mobile.

## 6. Motion tokens

| Token | Duración | Uso |
|---|---|---|
| `--motion-fast` | 150ms | hover, focus |
| `--motion-base` | 250ms | reveal, transitions |
| `--motion-slow` | 400ms | hero cascade total |
| `--motion-very-slow` | 600ms | page-level transitions |

Easing principal: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth ease-out).

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Único punto donde se neutralizan TODAS las animaciones.

## 7. Animaciones permitidas en v1

1. **View Transitions nativas** entre páginas (Astro `<ClientRouter />`).
2. **Reveal escalonado en hero** — palabras/líneas aparecen en cascada con `animation-delay: calc(var(--line-index) * 120ms)`. Total ≤400ms.
3. **Reveal on scroll** — utility `<Reveal>` con IntersectionObserver. Fade + slide-up 8-12px, 250ms, threshold 0.15. Todas las secciones del home (`ServicesSection`, `FeaturedProjects`, `ProcessSection`, `ShowcaseSection`, `AboutSection`, `FAQSection`, `MidCta`) usan `<Reveal>`; el `Hero` es la única excepción intencional porque va sobre el fold y ya resuelve su propia entrada con `.motion-cascade`. Listas largas (p. ej. el timeline de `/experiencia`) pueden pasar `delay` por índice (paso corto, tope ~240ms) para un stagger discreto entre items, sin acercarse al presupuesto de la cascada del hero.
4. **Hover transitions** — cards y links, 150ms (border, color, transform: translateY(-2px) en cards).
5. **CTA gradient shift** — solo en hover, 200ms.
6. **(Opcional)** caret blinking en hero (refuerza estética tech) — solo si quieres terminal-flavor.
7. **Scroll-driven scrub (CSS `animation-timeline`)** — efectos cinematográficos ligados a la posición de scroll, 100% CSS nativo (sin JS ni librerías). Solo `transform`/`opacity`, easing `linear` (el "easing" lo pone el scroll del usuario), envueltos en `@supports (animation-timeline: view())` para degradar a estático, y neutralizados en el bloque central de reduced-motion (las scroll-driven ignoran los overrides de duración — requieren `animation: none`). Utilities en `motion.css`: `.motion-scroll-hero-exit` (el hero se aleja y desvanece al salir del viewport) y `.motion-scroll-scrub` (display text crece al entrar). Máximo 1-2 usos por vista. NO es scroll-jacking: la animación refleja el scroll, nunca lo controla ni lo frena.

Animaciones explícitamente **prohibidas** en v1:
- Parallax
- Scroll-jacking (controlar/frenar el scroll del usuario; el scrub scroll-driven del punto 7 NO lo es)
- Mouse-followers
- Cursor custom (más allá de pointer estándar)
- GSAP / framer-motion-style heavy
- Gradientes animados en idle
- Confetti, particles, canvas effects

## 8. Componentes — anclas visuales

### Hero
- Radial gradient ambient detrás del título.
- Geist Sans peso 600, line-height 1, color `--text-0`.
- Eyebrow (línea sobre el título): JetBrains Mono uppercase tracking 0.1em, `--accent-400`.
- Subhead Inter 18-20px, `--text-2`.
- CTA principal abajo con gradient + shadow `--accent-glow`.

### Featured project card
- Border conic gradient sutil que rota muy lento al hover (no idle).
- Background `--bg-1`.
- Title Geist Sans 25px.
- Stack badges JetBrains Mono 12px sobre `--accent-100` opacity 0.1.
- Status pill arriba a la derecha.

### Interactive showcase demo panels (`ShowcaseSection`)
- Extiende el lenguaje de `.case-study-card__visual` (ventana de app falsa: topbar de 3 dots sobre `--bg-2`) a tres simuladores interactivos con datos ficticios: planta industrial (toggles marcha/paro que recalculan el resumen), presupuesto (partidas incluibles + total recalculado + botón "Generar PDF" simulado) y conmutador "Antes · Excel / Ahora · App" con buscador que filtra la tabla en vivo.
- HTML/CSS + un único `<script>` vanilla (progressive enhancement: sin JS todo se ve completo y estático); números en `font-mono` con `tabular-nums`.
- Controles nativos con semántica real (`aria-pressed`, label oculto en buscador, `aria-live` en valores recalculados); solo lo puramente ilustrativo (dots, barras, grid del Excel) sigue en `aria-hidden`.
- Layout bento en desktop (≥1024px): paneles 1+2 en fila de 2 columnas; el panel Excel→App ocupa la fila completa debajo con split horizontal (ventana del simulador ~60% izquierda, título + descripción centrados a la derecha). Mobile: 1 columna apilada.
- Hover: `translateY(-4px)` + `--shadow-card-hover`, `--motion-base`; cambio de vista con transición de opacity — sin animación en idle ni keyframes nuevos.

### Project card normal
- Border `--border` sólido.
- Hover: border `--accent-400`, translateY(-4px), `--shadow-card-hover`, `--motion-base` (250ms).
- Sin gradient — el borde gradient (`--gradient-border-featured`) queda reservado al featured card (§3 política de uso). El "más impacto" del hover en un card normal viene de la elevación + sombra, nunca del color de borde.
- Mismo patrón aplicado a las cards de `ServicesSection` (home) y a `.timeline__card` (`/experiencia`).

### CTA primario
- Background `--gradient-cta`.
- Color `--text-0`.
- Padding 12px 24px.
- Border radius 8px.
- Box shadow none idle, `0 0 0 4px var(--accent-glow)` en focus, gradient shift en hover.

### Lang switcher
- ES / EN como dos chips JetBrains Mono.
- Activo: `--accent-400` underline.
- Inactivo: `--text-3`.
- Hover: `--text-1`, 150ms.

## 9. Layout

### Container

Max-width 720px (prose pages: case studies, blog), 1080px (home, grid). Padding lateral fluido con clamp.

### Grid del portfolio (`/trabajos`)

12 columnas en desktop, 6 en tablet, 1 en mobile.
Featured projects ocupan 8 columnas; normales 4.
Filtros sticky arriba (status + tag).

### Spacing vertical entre secciones

Desktop: 128px. Mobile: 64px.

## 10. Iconografía

- Lucide icons (SVG, tree-shakeable).
- Stroke 1.5px estándar.
- Color heredado del contexto (`currentColor`).

## 11. Imágenes

- Astro `<Image>` con avif + webp + jpg fallback.
- Imágenes de proyecto: 16:9 ó 4:3, no mezclar ratios en el mismo grid.
- Hero del case study: máximo 1200px de ancho, lazy excepto la primera fold.

## 12. Pendiente de iterar

- Decidir si añadimos un acento secundario cálido (terracotta) además del morado, o si el morado es la única firma.
- Validar tipografías Geist Sans+Inter en mockup real (puede que Geist Sans necesite peso 500 para H secundarios).
- Definir patrón visual para el blog (¿hero por post? ¿solo título?).
- Ilustraciones / fotos del usuario para about — ¿hay foto, ilustración, o solo tipografía?
- ¿Logo propio o solo wordmark "marmibas"?

---

**Modificá libremente. Yo lo leo en cada iteración del proyecto y lo uso como fuente de verdad operativa.**
