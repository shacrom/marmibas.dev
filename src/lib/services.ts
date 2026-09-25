export const spanishServices = [
  {
    key: 'shop',
    slug: 'tiendas-online',
    title: 'Tiendas online a medida',
    /** Mosaic module display name (E4 mockup) — distinct from `title`, which stays for SEO/JSON-LD. */
    shortTitle: 'Tiendas online',
    description:
      'E-commerce con pasarelas de pago, stock, envíos y panel propio para vender sin pelearte con plantillas.',
    keyword: 'E-commerce',
    iconName: 'shopping-bag',
    // Verbatim from the former /servicios/tiendas-online "Lo que entrego" list —
    // the 4 items the E4 mockup's `inc` array selects.
    includes: [
      'Catálogo y fichas de producto',
      'Checkout y pasarelas de pago',
      'Envíos y zonas de reparto',
      'Cuadro de mando para tu equipo',
    ],
  },
  {
    key: 'management',
    slug: 'sistemas-de-gestion',
    title: 'Sistemas de gestión',
    description:
      'Software interno para llevar clientes, presupuestos, facturas y calendario en un único sitio.',
    keyword: 'Backoffice',
    iconName: 'layout-dashboard',
    // Verbatim from the former /servicios/sistemas-de-gestion "Lo que entrego" list.
    includes: [
      'Ficha de clientes y proveedores',
      'Presupuestos y facturas',
      'Calendario y planificación',
      'Migración desde Excel u otras herramientas',
    ],
  },
  {
    key: 'mobile',
    slug: 'aplicaciones-moviles',
    title: 'Aplicaciones móviles',
    description:
      'Apps iOS y Android para empleados o clientes, con publicación en stores incluida.',
    keyword: 'Mobile',
    iconName: 'smartphone',
    // Verbatim from the former /servicios/aplicaciones-moviles "Lo que entrego" list.
    includes: [
      'App iOS y Android',
      'Modo offline y sincronización',
      'Notificaciones push',
      'Publicación en stores',
    ],
  },
  {
    key: 'automation',
    slug: 'automatizaciones',
    title: 'Automatizaciones',
    description:
      'Tareas repetitivas que se ejecutan solas: presupuestos, emails, informes, facturación.',
    keyword: 'Procesos',
    iconName: 'zap',
    // Verbatim from the former /servicios/automatizaciones "Lo que entrego" list.
    includes: [
      'Generación automática de documentos',
      'Emails y notificaciones programadas',
      'Sincronización entre apps',
      'Alertas y monitorización',
    ],
  },
  {
    key: 'web',
    slug: 'webs-corporativas',
    title: 'Webs corporativas',
    description:
      'Webs rápidas, accesibles y bien posicionadas en buscadores, sin plantillas genéricas.',
    keyword: 'Web',
    iconName: 'globe',
    // Verbatim from the former /servicios/webs-corporativas "Lo que entrego" list.
    includes: [
      'Velocidad de carga top',
      'SEO técnico incluido',
      'Formularios y captación de leads',
      'Panel sencillo para editar contenido',
    ],
  },
  {
    key: 'webApp',
    slug: 'desarrollo-aplicaciones-web',
    title: 'Desarrollo de aplicaciones web',
    /** Mosaic module display name (E4 mockup) — distinct from `title`, which stays for SEO/JSON-LD. */
    shortTitle: 'Aplicaciones web',
    description:
      'Plataformas web a medida para clientes o equipos: accesibles desde el navegador, seguras y preparadas para crecer.',
    keyword: 'Aplicaciones web',
    iconName: 'layout-dashboard',
    // Verbatim from the former /servicios/desarrollo-aplicaciones-web "Qué construimos" cards
    // (that page only had these 4, so all of them carry over).
    includes: [
      'Portales para clientes',
      'Herramientas para equipos',
      'Procesos conectados',
      'Base técnica mantenible',
    ],
  },
  {
    key: 'integration',
    slug: 'integraciones',
    title: 'Integraciones',
    description:
      'Conexiones entre WhatsApp, ERP, hojas de cálculo, email y demás herramientas que ya usas.',
    keyword: 'Conexión',
    iconName: 'plug-zap',
    // Verbatim from the former /servicios/integraciones "Lo que entrego" list.
    includes: [
      'Conexión con WhatsApp Business',
      'Sincronización con tu ERP',
      'Hojas de cálculo vivas',
      'Email y CRM unidos',
    ],
  },
] as const;

export type SpanishService = (typeof spanishServices)[number];

export const spanishServicePaths = new Set(
  spanishServices.map((service) => `/servicios/${service.slug}`)
);

export function isSpanishServicePath(pathname: string): boolean {
  return spanishServicePaths.has(pathname.replace(/\/$/, ''));
}

// ---------------------------------------------------------------------------
// Mosaic display order (S1, `odd/tasks/services-mosaic.md`)
// ---------------------------------------------------------------------------
// The `/servicios` mosaic renders services in the exact NN 01-07 order of the
// owner-approved E4 mockup, which differs from `spanishServices`' own array
// order (kept untouched — the home `ServicesPane` keeps its pre-existing row
// order/labels, unrelated to this reordering).

export const MOSAIC_SLUG_ORDER = [
  'tiendas-online',
  'sistemas-de-gestion',
  'automatizaciones',
  'integraciones',
  'desarrollo-aplicaciones-web',
  'aplicaciones-moviles',
  'webs-corporativas',
] as const;

/** Returns every service, ordered per `MOSAIC_SLUG_ORDER`. */
export function servicesInMosaicOrder(): SpanishService[] {
  return MOSAIC_SLUG_ORDER.map((slug) => {
    const service = spanishServices.find((candidate) => candidate.slug === slug);
    if (!service) throw new Error(`Missing service for mosaic slug: ${slug}`);
    return service;
  });
}

// ---------------------------------------------------------------------------
// Drawer placement helpers (S1/S2) — pure functions mirroring the E4
// mockup's `renderVals()` insertion rule, generalised to any column count so
// the same logic drives desktop (4 cols), tablet (2 cols) and mobile (1 col).
// ---------------------------------------------------------------------------

/**
 * Index (0-based) at which the open drawer panel should be inserted among
 * the mosaic's flat list of cells (7 services + the trailing "¿otra cosa?"
 * CTA card), for a given number of grid columns.
 *
 * Mirrors the mockup: `Math.min((Math.floor(open / columns) + 1) * columns,
 * total)` — the drawer goes right after the last cell of the visual row
 * that contains the open module, clamped to the total cell count.
 */
export function drawerInsertIndex(openIndex: number, columns: number, total: number): number {
  if (!Number.isInteger(columns) || columns <= 0) {
    throw new Error('columns must be a positive integer');
  }
  const rowEnd = (Math.floor(openIndex / columns) + 1) * columns;
  return Math.min(rowEnd, total);
}

/**
 * Horizontal position (percentage, 0-100) of the drawer's notch, centered
 * within the open module's own column. Mirrors the mockup:
 * `((open % columns) + 0.5) * (100 / columns)`.
 */
export function drawerNotchPercent(openIndex: number, columns: number): number {
  if (!Number.isInteger(columns) || columns <= 0) {
    throw new Error('columns must be a positive integer');
  }
  return ((openIndex % columns) + 0.5) * (100 / columns);
}
