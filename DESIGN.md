# DESIGN.md — marmibas.dev

> **Estado**: en migración a "B3 · Terminal" (redesign completo del sitio).
> Última actualización: 2026-09-25.

## 1. Filosofía visual

**Terminal: prompts, monoespaciada, violeta como señal, movimiento con propósito.**

Cuatro principios de diseño que mandan sobre todo lo demás:

1. **Oscuro primero, casi negro**. La estética nace dark; no hay tema claro en v1. Los fondos ya no son "dark tech" con tinte violeta perceptible — son prácticamente negros, con el violeta reservado para lo que importa.
2. **Morado como señal, no como decoración**. El violeta (`--accent-400`) aparece donde comunica: prompt (`marcos@marmibas`), CTAs, focus states, iconos de sección, status "en producción". Nunca en backgrounds planos ni en body text.
3. **Monoespaciada de punta a punta**. Todo el sitio — body, headings, UI — usa fuentes mono. No hay una tipografía "humana" de contraste; la identidad viene de la disciplina, no de mezclar familias.
4. **Movimiento con propósito, nunca decorativo**. Las animaciones imitan comportamiento real de terminal (tecleo, impresión de líneas, cursor parpadeante, spinners que resuelven en `✓`) — cada una comunica progreso o estado, ninguna existe solo para "verse bien".

## 2. Paleta

### Base oscura (casi negro, tinte violeta apenas perceptible)

| Token | Hex | Uso |
|---|---|---|
| `--bg-0` | `#08070b` | Fondo principal de la página |
| `--bg-1` | `#0c0b11` | Ventana/surface (pane de terminal) |
| `--bg-2` | `#0e0d14` | Panel elevado sobre una ventana |
| `--bg-inset` | `#0a090e` | Barra de título, status strips — el nivel MÁS oscuro |

### Texto

| Token | Hex | Uso |
|---|---|---|
| `--text-0` | `#e9e6f2` | Headings, foco máximo |
| `--text-1` | `#c9c5d6` | Body text |
| `--text-2` | `#9b97a8` | Texto secundario, captions, prompts |
| `--text-3` | `#8a8697` | Muted, metadata, placeholders |
| `--border` | `#24222e` | Bordes sutiles, separadores |
| `--border-strong` | `#3a3746` | Bordes que necesitan más presencia (botones outline, dividers de título) |

### Acento morado (escala violet — sin cambios respecto al sistema anterior)

| Token | Hex | Uso |
|---|---|---|
| `--accent-100` | `#ede9fe` | Backgrounds de chips/badges sobre dark |
| `--accent-300` | `#c4b5fd` | Hover suave, highlights |
| `--accent-400` | `#a78bfa` | **Principal** — prompt, links, focus, CTAs, status success |
| `--accent-500` | `#8b5cf6` | Hover/active de CTAs primarios |
| `--accent-600` | `#7c3aed` | Deep — decoración puntual |
| `--accent-700` | `#6d28d9` | Sombras, profundidad |
| `--accent-glow` | `rgba(139, 92, 246, 0.15)` | Glow heredado (usado por componentes previos) |

### Semántico — danger / warning

| Token | Valor | Uso |
|---|---|---|
| `--danger` | `#fca5a5` | Texto y bordes de error (validación de formularios) |
| `--danger-bg` | `rgba(248, 113, 113, 0.12)` | Wash de fondo para alertas de error |
| `--warning` | `#dcc3b1` | Reservado para estados intermedios (advertencia, "en desarrollo") |

### Status (proyecto)

| Status | Color | Uso |
|---|---|---|
| Success / en producción | `var(--accent-400)` | Voxye, Recetas Novatex |
| En desarrollo | `#c9a892` (terracotta muted) | Jinba, Acompaña |
| Side project / pausado | `#71717a` (neutral) | Feed Me, Puro Padel |
| Experiencia previa | `var(--text-2)` | Capgemini, Cleverpy, Devoltec |

Los grises "pausado"/"previo" se mantienen sin cambio de valor: sobre el nuevo fondo casi negro leen con MÁS contraste que antes, no menos.

## 3. Degradados

### Política de uso

La estética terminal es deliberadamente **plana**: los degradados decorativos del sistema anterior (hero ambient perceptible, CTA con gradient visible, borde conic) se retiran del lenguaje visual. Los tokens `--gradient-*` se **conservan** (19 archivos los consumen vía `var()`) pero cada uno colapsa a:

- Un **relleno sólido** (`--gradient-cta`, `--gradient-cta-hover`, `--gradient-text-display`, `--gradient-border-featured`) — sigue siendo un `<gradient>` válido en CSS (dos paradas del mismo color) para que `background-clip: text` y cualquier `background-image` que lo consuma sigan funcionando sin tocar el componente.
- Un **ambient casi imperceptible** (`--gradient-hero-ambient`) — un radial sutil al 8% de opacidad, presente pero no protagonista.

Prohibido en v1 (sin cambios respecto al sistema anterior):
- Cards normales (border sólido).
- Navbar y footer (color sólido).
- Body text (siempre `--text-1`).
- Botones secundarios (outline + color sólido).

### Definiciones

```css
--gradient-hero-ambient: radial-gradient(
  ellipse at top,
  rgba(167, 139, 250, 0.08) 0%,
  transparent 60%
);

--gradient-cta: linear-gradient(#a78bfa, #a78bfa);

--gradient-cta-hover: linear-gradient(#c4b5fd, #c4b5fd);

--gradient-text-display: linear-gradient(#e9e6f2, #e9e6f2);

--gradient-border-featured: linear-gradient(#a78bfa, #a78bfa);
```

## 4. Tipografía

| Familia | Uso | Pesos | Fuente |
|---|---|---|---|
| **Space Mono** | H1, H2, hero, display | 400, 700 (preload) | Self-hosted |
| **IBM Plex Mono** | body, nav, UI, code | 400 (preload), 500, 600 | Self-hosted |

Todo el sitio es monoespaciado — no hay una familia "sans" de contraste. `--font-sans` y `--font-mono` apuntan al mismo IBM Plex Mono; se mantienen como tokens separados porque distintos componentes ya los referencian con intención semántica distinta (body vs. `code`/badges), aunque hoy resuelvan a la misma fuente.

### Escala

Base 16px. Ratio 1.25 (major third) — sin cambios.

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

- Hero usa Space Mono peso 700 para máximo carácter — imita el prompt de un terminal real.
- Headings de sección usan Space Mono 700.
- `code`, badges, version numbers, fechas usan IBM Plex Mono (vía `--font-mono`).
- Body es IBM Plex Mono siempre. Space Mono queda reservado a display.

## 5. Espaciado

Base 4px. Escala: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Sin cambios respecto al sistema anterior.

Ritmo vertical generoso: secciones separan con 96-128px en desktop, 48-64px en mobile.

## 6. Radios y sombras

Terminal: geometría escuadrada, casi sin curva. Nada de card "soft" con esquinas de 12-24px.

| Token | Valor antes | Valor terminal |
|---|---|---|
| `--radius-xs` | 2px | 1px |
| `--radius-sm` | 4px | 2px |
| `--radius-md` | 8px | 2px |
| `--radius-lg` | 12px | 4px |
| `--radius-xl` | 16px | 6px |
| `--radius-2xl` | 24px | 10px |
| `--radius-full` | 9999px | 9999px (sin cambio — chips/avatares circulares) |

Sombras: sin elevación tradicional con sombra negra proyectada. `--shadow-glow` es un anillo violeta translúcido para focus; `--shadow-card-hover` combina un aro de 1px con un resplandor difuso bajo.

```css
--shadow-glow: 0 0 0 4px rgba(167, 139, 250, 0.18);
--shadow-card: 0 1px 0 rgba(0, 0, 0, 0.4);
--shadow-card-hover:
  0 0 0 1px rgba(167, 139, 250, 0.3),
  0 0 30px rgba(167, 139, 250, 0.1);
```

## 7. Motion tokens y política

Los tokens de duración/easing (`src/styles/motion.css`) no cambian de valor en T1 — la política de movimiento de la terminal reutiliza el mismo sistema, con nuevas animaciones que se añaden en tareas posteriores.

| Token | Duración | Uso |
|---|---|---|
| `--motion-fast` | 150ms | hover, focus |
| `--motion-base` | 250ms | reveal, transitions |
| `--motion-slow` | 400ms | hero cascade total |
| `--motion-very-slow` | 600ms | page-level transitions |

Easing principal: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth ease-out).

### Reduced motion

CSS-first, sin librerías de animación. Único punto donde se neutralizan TODAS las animaciones — vive en `src/styles/motion.css` y no se duplica en ningún otro sitio:

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

Progressive enhancement: el HTML renderizado en servidor ya muestra el estado final; JS solo añade la coreografía encima. Sin JS, el sitio se ve completo y estático.

### Animaciones permitidas (terminal)

1. **Tecleo de comandos** — el prompt "escribe" el comando letra a letra (`steps()` timing, como en el mockup: `whoami`, `cat enfoque.txt`, `ls servicios/`).
2. **Impresión de líneas** — líneas de output aparecen de golpe tras el "tecleo", como el resultado real de un comando.
3. **Cursor parpadeante** — bloque o `_` con `caret-blink` (ya definido en `motion.css`), refuerza la estética prompt.
4. **Spinners que resuelven en `✓`** — checklist de diagnóstico: spinner mientras "procesa", check morado al completar.
5. **Contadores en vivo** — métricas que cuentan hacia su valor final (`tabular-nums`, sin layout shift).
6. **Barrido / scanlines sutiles** — efecto opcional y muy discreto de scanline o glow que recorre un panel; nunca ruido visual dominante.
7. **View Transitions nativas** entre páginas (Astro `<ClientRouter />`) — se mantiene del sistema anterior.
8. **Reveal on scroll** — utility `<Reveal>` con IntersectionObserver, fade + slide-up 8-12px, 250ms — se mantiene.
9. **Hover transitions** — cards y links, 150ms (border, color, transform) — se mantiene.
10. **Scroll-driven scrub** (`animation-timeline: view()`) — se mantiene donde ya existe, con el mismo presupuesto (máx. 1-2 usos por vista, solo `transform`/`opacity`, envuelto en `@supports`).

Animaciones explícitamente **prohibidas** (sin cambios respecto al sistema anterior):
- Parallax.
- Scroll-jacking (controlar/frenar el scroll del usuario; el scrub scroll-driven NO lo es).
- Mouse-followers.
- Cursor custom (más allá de pointer estándar y el caret de terminal, que es contenido, no cursor de sistema).
- GSAP / framer-motion-style heavy.
- Gradientes animados en idle.
- Confetti, particles, canvas effects.

## 8. Componentes terminal (vendrán en T2-T6)

Los siguientes componentes materializan la estética terminal en el resto del sitio. Se documentan aquí como contrato de diseño; su implementación es tarea de las fases siguientes del redesign.

### Ventana / pane (`TerminalPane`)
- Contenedor con barra de título estilo terminal: `~/ruta [n/7]` — ruta ficticia + índice de sección sobre el total, en `--bg-inset`.
- Cuerpo sobre `--bg-1`, borde `--border`.
- Tres "luces" decorativas opcionales (`aria-hidden`) en la barra, en la tradición de ventana macOS — puramente ornamental.

### Prompt (`Prompt`)
- `marcos@marmibas` en `--accent-400` + `:~$ ` en `--text-2`, seguido del comando en `--text-0`.
- Usado como encabezado de cada bloque de contenido (hero, servicios, diagnóstico) para dar continuidad narrativa de "sesión de terminal".

### Botones (`[ Acción ]`)
- Sintaxis de corchetes literal: `[ Hablemos ]`, `[ Ver mi trabajo ]` — refuerza la lectura como comando ejecutable.
- Primario: fondo `--gradient-cta` (sólido `--accent-400`), texto `--text-0`.
- Secundario: outline `--border-strong`, texto `--text-1`.
- Radio `--radius-md` (2px — casi recto), altura mínima 44px táctil.

### Estado (`[+]` / `[-]`)
- Indicador de estado tipo diff: `[+]` en `--accent-400` para "activo/completado", `[-]` en `--text-3` para "pendiente/inactivo".
- Usado en checklists de diagnóstico y listas de servicios.

## 9. Layout

### Container

Max-width 720px (prose pages: case studies), 1080px (home, grid). Padding lateral fluido con clamp. Sin cambios.

### Grid del portfolio (`/trabajos`)

12 columnas en desktop, 6 en tablet, 1 en mobile. Featured projects ocupan 8 columnas; normales 4. Filtros sticky arriba (status + tag). Sin cambios.

### Spacing vertical entre secciones

Desktop: 128px. Mobile: 64px. Sin cambios.

## 10. Iconografía

- Lucide icons (SVG, tree-shakeable).
- Stroke 1.5px estándar.
- Color heredado del contexto (`currentColor`).

## 11. Imágenes

- Astro `<Image>` con avif + webp + jpg fallback.
- Imágenes de proyecto: 16:9 ó 4:3, no mezclar ratios en el mismo grid.
- Hero del case study: máximo 1200px de ancho, lazy excepto la primera fold.

## 12. Accesibilidad

- Contraste **WCAG AA** en todo texto sobre fondo — los tokens de esta paleta están elegidos para cumplirlo sobre `--bg-0`/`--bg-1`/`--bg-2` (fondos casi negros + texto claro maximiza el margen de contraste respecto al sistema anterior).
- Objetivos táctiles **≥ 44px** en mobile para cualquier elemento interactivo (botones, links de nav, chips de lang switcher).
- **Foco visible** en todo elemento focusable — anillo `--accent-400` vía `:focus-visible`, nunca se suprime el outline nativo sin sustituto.
- Toda animación decorativa (tecleo, cursor, scanlines) se neutraliza bajo `prefers-reduced-motion: reduce`; el contenido nunca depende de la animación para ser legible o accesible (progressive enhancement: el estado final ya está en el HTML servido).
- Componentes terminal usan semántica real (`<button>`, `<a>`, `aria-live` en contadores/valores recalculados) — el corchete `[ Acción ]` es texto decorativo dentro de un elemento interactivo real, nunca un div con `onclick`.

## 13. Idiomas

**EN sigue oculto.** El locale inglés (`/en/*`) permanece `noindex`, sin language switcher visible y sin alternates `hreflang` verdaderos — se mantiene como locale de trabajo, no publicado, igual que en el sistema anterior. El redesign terminal cubre ambos locales (ES/EN) para que el código no diverja, pero solo ES es la superficie pública real.

## 14. Pendiente de iterar

- Validar tipografías Space Mono + IBM Plex Mono en mockup real a escala completa (home entero, no solo hero).
- Definir el patrón visual final de `TerminalPane`/`Prompt` en su tarea de implementación (T2) — este documento fija el contrato, no el marcado exacto.
- Revisar si el acento magenta/pink (`--color-accent-magenta`, `--color-accent-pink`, sin uso actual) se retira del tema o se reserva para un caso futuro.

---

**Modificá libremente. Yo lo leo en cada iteración del proyecto y lo uso como fuente de verdad operativa.**
