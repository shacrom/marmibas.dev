/**
 * theme-canvas — efectos de fondo canvas 2D por tema (temporal, exploración A/B).
 *
 * Parte del sistema de temas seleccionables (ver src/styles/themes.css y
 * src/components/ui/ThemeBackground.astro). Implementa a mano (cero deps npm)
 * los dos temas con fondo canvas:
 *
 *   - constelacion → red de nodos conectados ("sistemas distribuidos"):
 *     partículas con drift lento y líneas entre vecinas cercanas cuya
 *     opacidad es proporcional a la proximidad.
 *   - circuito     → grid de cuadraditos que parpadean suavemente al azar
 *     (estética placa de circuito / CAD).
 *
 * Este módulo se carga SOLO vía import() dinámico desde ThemeBackground
 * cuando el tema activo lo necesita — nunca entra en el bundle inicial.
 *
 * Ciclo de vida:
 *   - start(canvas, theme): (re)inicializa y arranca el rAF loop.
 *   - stop(): cancela el rAF, limpia el canvas y desregistra listeners.
 *   - Pausa automática cuando la pestaña está oculta (visibilitychange).
 *   - Resize + escala devicePixelRatio (DPR capado a 2).
 *   - prefers-reduced-motion: reduce → dibuja UN frame estático, sin loop.
 */

export type CanvasTheme = 'constelacion' | 'circuito';

/* ------------------------------------------------------------------------ */
/* Estado del runtime (módulo singleton: solo hay un canvas de fondo).       */
/* ------------------------------------------------------------------------ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Cell {
  x: number;
  y: number;
  opacity: number;
  target: number;
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let theme: CanvasTheme | null = null;
let rafId = 0;
let running = false;
let width = 0;
let height = 0;
let accent = '#8fa0c0';
let particles: Particle[] = [];
let cells: Cell[] = [];

const LINK_DISTANCE = 130;
const CELL_SIZE = 3;
const CELL_GAP = 16;
const CELL_PITCH = CELL_SIZE + CELL_GAP;
const MAX_CELL_OPACITY = 0.3;

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------------------------------------------------ */
/* Setup: tamaño, DPR y datos por tema.                                      */
/* ------------------------------------------------------------------------ */

function readAccent(): string {
  // Se lee en init y en cada cambio de tema: el token cambia con data-theme.
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-accent-400')
    .trim();
  return value || '#8fa0c0';
}

function resizeCanvas(): void {
  if (!canvas || !ctx) return;

  width = window.innerWidth;
  height = window.innerHeight;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function initParticles(): void {
  // Cuenta escalada por área del viewport: ~70 en desktop, menos en móvil.
  const count = Math.max(24, Math.min(80, Math.round((width * height) / 18000)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    // Drift MUY lento — la red debe leerse elegante, no ajetreada.
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
  }));
}

function initCells(): void {
  cells = [];
  const cols = Math.ceil(width / CELL_PITCH);
  const rows = Math.ceil(height / CELL_PITCH);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({
        x: col * CELL_PITCH,
        y: row * CELL_PITCH,
        opacity: 0,
        // Solo unas pocas celdas arrancan encendidas.
        target: Math.random() < 0.12 ? Math.random() * MAX_CELL_OPACITY : 0,
      });
    }
  }
}

function initScene(): void {
  resizeCanvas();
  if (theme === 'constelacion') {
    initParticles();
  } else if (theme === 'circuito') {
    initCells();
  }
}

/* ------------------------------------------------------------------------ */
/* Render por tema. Solo dibujo 2D básico — nada de filtros costosos.        */
/* ------------------------------------------------------------------------ */

function drawConstellation(step: boolean): void {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  if (step) {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      // Wrap en bordes para que la red nunca se vacíe por un lateral.
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
    }
  }

  // Enlaces entre vecinas cercanas — opacidad proporcional a la proximidad.
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  for (let i = 0; i < particles.length; i++) {
    const source = particles[i];
    if (!source) continue;
    for (let j = i + 1; j < particles.length; j++) {
      const target = particles[j];
      if (!target) continue;
      const dx = source.x - target.x;
      const dy = source.y - target.y;
      const dist = Math.hypot(dx, dy);
      if (dist < LINK_DISTANCE) {
        ctx.globalAlpha = (1 - dist / LINK_DISTANCE) * 0.35;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    }
  }

  // Nodos.
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.7;
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawCircuit(step: boolean): void {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  if (step) {
    // Cada frame, un subconjunto pequeño elige un nuevo target de opacidad;
    // todas las celdas interpolan suavemente hacia su target (sin saltos).
    const flips = Math.max(1, Math.round(cells.length * 0.005));
    for (let k = 0; k < flips; k++) {
      const cell = cells[(Math.random() * cells.length) | 0];
      if (!cell) continue;
      cell.target = Math.random() < 0.55 ? Math.random() * MAX_CELL_OPACITY : 0;
    }
    for (const cell of cells) {
      cell.opacity += (cell.target - cell.opacity) * 0.04;
    }
  }

  ctx.fillStyle = accent;
  for (const cell of cells) {
    if (cell.opacity < 0.01) continue;
    ctx.globalAlpha = cell.opacity;
    ctx.fillRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
  }
  ctx.globalAlpha = 1;
}

function drawFrame(step: boolean): void {
  if (theme === 'constelacion') {
    drawConstellation(step);
  } else if (theme === 'circuito') {
    drawCircuit(step);
  }
}

/* ------------------------------------------------------------------------ */
/* Loop rAF + pausa por visibilidad.                                         */
/* ------------------------------------------------------------------------ */

function loop(): void {
  drawFrame(true);
  rafId = window.requestAnimationFrame(loop);
}

function startLoop(): void {
  window.cancelAnimationFrame(rafId);
  if (reducedMotionQuery.matches) {
    // Reduced motion: un único frame estático, sin animación.
    drawFrame(false);
    return;
  }
  rafId = window.requestAnimationFrame(loop);
}

function handleVisibility(): void {
  if (!running) return;
  if (document.visibilityState === 'hidden') {
    window.cancelAnimationFrame(rafId);
  } else {
    startLoop();
  }
}

function handleResize(): void {
  if (!running) return;
  initScene();
  if (reducedMotionQuery.matches) drawFrame(false);
}

function handleMotionChange(): void {
  if (!running) return;
  startLoop();
}

/* ------------------------------------------------------------------------ */
/* API pública.                                                              */
/* ------------------------------------------------------------------------ */

/**
 * Arranca (o re-arranca) el efecto sobre el canvas dado. Idempotente: si ya
 * corre el mismo tema sobre el mismo canvas no hace nada; si cambia el tema
 * o el canvas (p.ej. tras una View Transition), re-inicializa todo.
 */
export function start(canvasEl: HTMLCanvasElement, themeName: CanvasTheme): void {
  if (running && canvas === canvasEl && theme === themeName) return;

  stop();

  canvas = canvasEl;
  ctx = canvasEl.getContext('2d');
  if (!ctx) return;

  theme = themeName;
  accent = readAccent();
  running = true;

  initScene();
  startLoop();

  window.addEventListener('resize', handleResize);
  document.addEventListener('visibilitychange', handleVisibility);
  reducedMotionQuery.addEventListener('change', handleMotionChange);
}

/** Detiene el efecto por completo y libera listeners y canvas. */
export function stop(): void {
  if (!running && !canvas) return;

  window.cancelAnimationFrame(rafId);
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('visibilitychange', handleVisibility);
  reducedMotionQuery.removeEventListener('change', handleMotionChange);

  if (ctx) ctx.clearRect(0, 0, width, height);

  running = false;
  theme = null;
  canvas = null;
  ctx = null;
  particles = [];
  cells = [];
}
