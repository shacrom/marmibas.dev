/**
 * Diccionario UI (ES — único idioma publicado).
 *
 * - ES es el idioma por defecto y el único soportado; no lleva prefijo de URL.
 * - ES está pensado para PYMEs y emprendedores en España: español neutro,
 *   tuteo (tú/tu/te), tono cercano y claro, sin tecnicismos ni jerga.
 * - La versión en inglés (`/en/*`) se eliminó (ver `odd/tasks/site-cleanup.md`
 *   C2). `languages`/`Language` conservan la forma `Record<Language, string>`
 *   deliberadamente — así queda listo para reintroducir un segundo idioma
 *   simplemente añadiendo su entrada aquí y su diccionario en `ui`.
 *
 * Las claves usan dot-notation (`namespace.key`) para que el helper
 * `useTranslations` (T-13) pueda resolverlas con un único string.
 */

export const languages = {
  es: 'Español',
} as const;

export type Language = keyof typeof languages;

export const defaultLang = 'es' as const satisfies Language;

export const ui = {
  es: {
    // -- Navegación principal -------------------------------------------------
    'nav.home': 'Inicio',
    'nav.work': 'Trabajos',
    'nav.services': 'Servicios',
    'nav.experience': 'Experiencia',
    'nav.contact': 'Contacto',

    // -- Header (terminal, T3) -------------------------------------------------
    'header.clock': 'Hora en España',
    'header.menu.open': 'Abrir menú',
    'header.menu.close': 'Cerrar menú',

    // -- Footer ---------------------------------------------------------------
    'footer.social.github': 'GitHub',
    'footer.social.linkedin': 'LinkedIn',
    'footer.social.email': 'Email',

    // -- Botones / CTAs -------------------------------------------------------
    'cta.contact': 'Hablemos',
    'cta.viewWork': 'Ver mi trabajo',

    // -- Formulario de contacto ----------------------------------------------
    'form.name.label': 'Nombre',
    'form.name.placeholder': 'Cómo te llamas',
    'form.email.label': 'Email',
    'form.email.placeholder': 'tu@email.com',
    'form.message.label': 'Mensaje',
    'form.message.placeholder': 'Cuéntame en qué estás y cómo puedo ayudarte',
    'form.submit': 'Enviar mensaje',
    'form.success': 'Mensaje enviado. Te respondo en menos de 48 h.',
    'form.error': 'Algo ha salido mal. Inténtalo de nuevo o escríbeme a info@marmibas.dev.',

    // -- Status labels --------------------------------------------------------
    'status.success': 'Para un cliente, ya en uso',
    'status.inProduction': 'Para un cliente, ya en uso',
    'status.inDevelopment': 'Construyéndolo ahora',
    'status.sideProject': 'Proyecto propio',
    'status.paused': 'En pausa',
    'status.prevExperience': 'Experiencia previa',

    // -- Meta / layout / a11y -------------------------------------------------
    'meta.skipToContent': 'Saltar al contenido',

    // -- Listados / contenido vacío ------------------------------------------
    'common.backTo': 'Volver a',
    'toc.label': 'Contenido',

    // -- Home: Featured projects (T-30) --------------------------------------
    'featured.heading': 'Casos de éxito',
    'featured.sub':
      'Soluciones reales que ya están en funcionamiento en empresas de distintos sectores.',
    'featured.viewAll': 'Ver todos los proyectos →',

    // -- Work index (T-34) ----------------------------------------------------
    'work.heading': 'Proyectos de software a medida',
    'work.tagline': 'Una selección de trabajos para clientes y proyectos propios.',
    'work.empty': 'Aún no hay proyectos en esta categoría.',

    // -- Home: About section (T-31) -------------------------------------------
    'about.heading': 'Quién está detrás de Marmibas',
    'about.bio.p1':
      'Soy Marcos. Soy ingeniero informático y llevo 5 años desarrollando software para empresas de todos los tamaños: startups, pymes y grandes compañías.',
    'about.bio.p2':
      'Hoy trabajo de forma independiente, ayudando a emprendedores, autónomos y pequeñas empresas a digitalizar su día a día. Para proyectos industriales trabajo junto a Plazasys, mi socio tecnológico. Si tu negocio tiene tareas repetitivas que te quitan tiempo, presupuestos llenos de errores, o información dispersa entre Excel y WhatsApp, puedo ayudarte.',
    'about.bio.p3':
      'Trabajo desde España, en remoto, con clientes en cualquier ubicación. Si tienes una idea o un problema que quieres resolver, escríbeme — la primera conversación es gratis y sin compromiso.',
    'about.cta.experience': 'Ver historia completa',
    'about.cta.contact': 'Hablemos',

    // -- Home: Services section ----------------------------------------------
    'services.heading': 'Herramientas que trabajan para tu negocio',
    'services.tagline':
      'Webs, tiendas online y programas de gestión hechos a tu medida, pensados para vender más y ahorrar horas.',
    'services.shop.title': 'Tiendas online',
    'services.shop.description':
      'Vende tus productos por internet con un sistema fácil de gestionar. Pedidos, stock, pagos seguros y envíos integrados.',
    'services.management.title': 'Sistemas de gestión interna',
    'services.management.description':
      'Software a medida para llevar el control de tu negocio: clientes, presupuestos, facturas, calendario, todo en un solo lugar.',
    'services.mobile.title': 'Aplicaciones móviles',
    'services.mobile.description':
      'Apps para iOS y Android para que tus empleados o clientes puedan trabajar desde el móvil donde estén.',
    'services.automation.title': 'Automatizaciones',
    'services.automation.description':
      'Tareas repetitivas que hoy te quitan horas: presupuestos, emails, informes, facturación. Las hacemos automáticas.',
    'services.web.title': 'Webs corporativas',
    'services.web.description':
      'Tu presencia digital lista para captar clientes: rápida, accesible, y bien posicionada en buscadores.',
    'services.webApp.title': 'Aplicaciones web',
    'services.webApp.description':
      'Plataformas web a medida para clientes o equipos: accesibles desde el navegador, seguras y preparadas para crecer.',
    'services.integration.title': 'Integraciones',
    'services.integration.description':
      'Conectamos las herramientas que ya usas (WhatsApp, email, hoja de cálculo, ERP) para que dejen de ser islas separadas.',

    // -- Experience page (T-35) ----------------------------------------------
    'experience.heading': 'Experiencia profesional',
    'experience.tagline': '5 años construyendo software en empresas de Valencia y remoto.',
    'experience.education.heading': 'Educación',
    'experience.education.degree': 'Grado en Ingeniería Informática',
    'experience.education.school': 'ETSE Universidad de Valencia',
    'experience.education.years': '2018 — 2023',
  },
} as const satisfies Record<Language, Record<string, string>>;

/**
 * Tipo del diccionario derivado del shape de ES (único idioma).
 * El `satisfies Record<Language, …>` de arriba mantiene el chequeo listo
 * para cuando se añada un segundo idioma.
 */
export type UIDictionary = typeof ui.es;
export type UIKey = keyof UIDictionary;
