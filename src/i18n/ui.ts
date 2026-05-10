/**
 * Diccionarios UI compartidos (ES/EN).
 *
 * - ES es el idioma por defecto (sin prefijo de URL).
 * - EN vive bajo `/en` (audiencia internacional, tono profesional).
 * - ES está pensado para PYMEs y emprendedores en España: español neutro,
 *   tuteo (tú/tu/te), tono cercano y claro, sin tecnicismos ni jerga.
 *
 * Las claves usan dot-notation (`namespace.key`) para que el helper
 * `useTranslations` (T-13) pueda resolverlas con un único string.
 *
 * Cualquier clave nueva debe existir en AMBOS idiomas. El tipo
 * `UIDictionary` deriva de `ui.es`, así TypeScript marca cualquier
 * desincronización entre locales en tiempo de compilación.
 */

export const languages = {
  es: 'Español',
  en: 'English',
} as const;

export type Language = keyof typeof languages;

export const defaultLang = 'es' as const satisfies Language;

export const ui = {
  es: {
    // -- Navegación principal -------------------------------------------------
    'nav.home': 'Inicio',
    'nav.work': 'Trabajos',
    'nav.projects': 'Proyectos',
    'nav.blog': 'Blog',
    'nav.experience': 'Experiencia',
    'nav.about': 'Sobre mí',
    'nav.contact': 'Contacto',

    // -- Footer ---------------------------------------------------------------
    'footer.copyright': 'marmibas',
    'footer.rss': 'RSS',
    'footer.social.github': 'GitHub',
    'footer.social.linkedin': 'LinkedIn',
    'footer.social.twitter': 'X (Twitter)',
    'footer.social.email': 'Email',

    // -- Botones / CTAs -------------------------------------------------------
    'cta.contact': 'Hablemos',
    'cta.viewWork': 'Ver mi trabajo',
    'cta.viewCaseStudy': 'Ver caso de estudio',
    'cta.viewProject': 'Ver proyecto',
    'cta.viewAllWork': 'Ver todos los trabajos',
    'cta.readMore': 'Leer más',
    'cta.backHome': 'Volver al inicio',
    'cta.backToTop': 'Volver arriba',
    'cta.sendMessage': 'Enviar mensaje',
    'cta.downloadCv': 'Descargar CV',
    'cta.copyEmail': 'Copiar email',
    'cta.emailCopied': 'Email copiado',

    // -- Formulario de contacto ----------------------------------------------
    'form.name.label': 'Nombre',
    'form.name.placeholder': 'Cómo te llamas',
    'form.email.label': 'Email',
    'form.email.placeholder': 'tu@email.com',
    'form.message.label': 'Mensaje',
    'form.message.placeholder': 'Cuéntame en qué estás y cómo puedo ayudarte',
    'form.submit': 'Enviar mensaje',
    'form.sending': 'Enviando…',
    'form.success': 'Mensaje enviado. Te respondo en menos de 48 h.',
    'form.error': 'Algo salió mal. Probá de nuevo o escribime a info@marmibas.dev.',
    'form.error.rateLimit': 'Has enviado varios mensajes seguidos. Esperá unos minutos y volvé a intentarlo.',
    'form.error.validation': 'Revisá los campos y volvé a enviar.',
    'form.validation.nameRequired': 'Decime cómo te llamás.',
    'form.validation.nameTooShort': 'El nombre debe tener al menos 2 caracteres.',
    'form.validation.emailRequired': 'Necesito un email para responderte.',
    'form.validation.emailInvalid': 'El email no parece válido.',
    'form.validation.messageRequired': 'Cuéntame en qué puedo ayudarte.',
    'form.validation.messageMinLength': 'El mensaje necesita al menos 10 caracteres.',
    'form.validation.messageMaxLength': 'El mensaje no puede pasar de 2000 caracteres.',

    // -- Status labels --------------------------------------------------------
    'status.success': 'En producción',
    'status.inProduction': 'En producción',
    'status.inDevelopment': 'En desarrollo',
    'status.sideProject': 'Side project',
    'status.paused': 'Pausado',
    'status.prevExperience': 'Experiencia previa',

    // -- Meta / layout / a11y -------------------------------------------------
    'meta.skipToContent': 'Saltar al contenido',
    'meta.languageSwitcher': 'Cambiar idioma',
    'meta.langSwitcherLabel': 'Idioma',
    'meta.currentLanguage': 'Idioma actual',
    'meta.toggleMenu': 'Abrir menú',
    'meta.closeMenu': 'Cerrar menú',
    'meta.openExternal': 'Abrir en una pestaña nueva',
    'meta.search': 'Buscar',

    // -- Listados / contenido vacío ------------------------------------------
    'common.readMore': 'Leer más',
    'common.backTo': 'Volver a',
    'common.viewProject': 'Ver proyecto',
    'common.viewCaseStudy': 'Ver caso de estudio',
    'common.publishedOn': 'Publicado el',
    'common.updatedOn': 'Actualizado el',
    'common.readingTime': 'min de lectura',
    'common.tableOfContents': 'En esta página',
    'toc.label': 'Contenido',
    'common.relatedPosts': 'Posts relacionados',
    'common.previousPost': 'Post anterior',
    'common.nextPost': 'Post siguiente',
    'common.empty.posts': 'Aún no hay publicaciones. Volvé pronto.',
    'common.empty.work': 'No hay proyectos que coincidan con los filtros.',
    'common.filters.status': 'Estado',
    'common.filters.tag': 'Tecnología',
    'common.filters.clear': 'Limpiar filtros',
    'common.filters.all': 'Todos',

    // -- Home: Featured projects (T-30) --------------------------------------
    'featured.heading': 'Casos de éxito',
    'featured.sub': 'Soluciones reales que están funcionando hoy en empresas de carne y hueso.',
    'featured.viewAll': 'Ver todos los proyectos →',

    // -- Work index — grid + filtros (T-34) ----------------------------------
    'work.heading': 'Proyectos de software a medida',
    'work.tagline':
      'Una selección de proyectos en producción, en desarrollo y exploraciones.',
    'work.filter.label': 'Filtrar por',
    'work.filter.all': 'Todos',
    'work.filter.success': 'Casos de éxito',
    'work.filter.development': 'En desarrollo',
    'work.filter.sideProjects': 'Side projects',
    'work.empty': 'Aún no hay proyectos en esta categoría.',

    // -- Home: About section (T-31) -------------------------------------------
    'about.heading': 'Quién soy',
    'about.bio.p1':
      'Soy Marcos. Soy ingeniero informático y llevo 5 años desarrollando software para empresas de todos los tamaños: startups, pymes y grandes compañías.',
    'about.bio.p2':
      'Hoy trabajo de forma independiente, ayudando a emprendedores, autónomos y pequeñas empresas a digitalizar su día a día. Si tu negocio tiene tareas repetitivas que te quitan tiempo, presupuestos llenos de errores, o información dispersa entre Excel y WhatsApp, puedo ayudarte.',
    'about.bio.p3':
      'Trabajo desde España, en remoto, con clientes en cualquier ubicación. Si tienes una idea o un problema que quieres resolver, escríbeme — la primera conversación es gratis y sin compromiso.',
    'about.stats.years': 'Años de experiencia',
    'about.stats.yearsValue': '5+',
    'about.stats.projects': 'Proyectos en producción',
    'about.stats.projectsValue': '2+',
    'about.cta.experience': 'Ver historia completa',
    'about.cta.contact': 'Hablemos',

    // -- Home: Services section (Lo que hago) --------------------------------
    'services.heading': 'Lo que hago',
    'services.tagline':
      'Soluciones de software a medida para hacer crecer tu negocio.',
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
    'services.integration.title': 'Integraciones',
    'services.integration.description':
      'Conectamos las herramientas que ya usas (WhatsApp, email, hoja de cálculo, ERP) para que dejen de ser islas separadas.',

    // -- Experience page (T-35) ----------------------------------------------
    'experience.heading': 'Experiencia profesional',
    'experience.tagline':
      '5 años construyendo software en empresas de Valencia y remoto.',
    'experience.disclaimer':
      'Las empresas listadas son empleadores anteriores. Hoy trabajo de forma independiente.',
    'experience.education.heading': 'Educación',
    'experience.education.degree': 'Grado en Ingeniería Informática',
    'experience.education.school': 'ETSE Universidad de Valencia',
    'experience.education.years': '2018 — 2023',
    'experience.fallback': 'Experience details only available in Spanish for now.',

    // -- Blog (T-36 / T-37) ---------------------------------------------------
    'blog.heading': 'Notas sobre software y digitalización',
    'blog.tagline': 'Notas técnicas, decisiones y aprendizajes desde el camino.',
    'blog.empty': 'Pronto subo el primer post.',
    'blog.readingTime': '{n} min de lectura',

    // -- 404 ------------------------------------------------------------------
    'notFound.title': 'Esta página no existe',
    'notFound.description':
      'El enlace está roto o la página se movió. Podés volver al inicio o explorar los trabajos.',
    'notFound.backHome': 'Volver al inicio',
    'notFound.viewWork': 'Ver trabajos',
  },
  en: {
    // -- Main navigation ------------------------------------------------------
    'nav.home': 'Home',
    'nav.work': 'Work',
    'nav.projects': 'Projects',
    'nav.blog': 'Blog',
    'nav.experience': 'Experience',
    'nav.about': 'About',
    'nav.contact': 'Contact',

    // -- Footer ---------------------------------------------------------------
    'footer.copyright': 'marmibas',
    'footer.rss': 'RSS',
    'footer.social.github': 'GitHub',
    'footer.social.linkedin': 'LinkedIn',
    'footer.social.twitter': 'X (Twitter)',
    'footer.social.email': 'Email',

    // -- Buttons / CTAs -------------------------------------------------------
    'cta.contact': "Let's talk",
    'cta.viewWork': 'See my work',
    'cta.viewCaseStudy': 'View case study',
    'cta.viewProject': 'View project',
    'cta.viewAllWork': 'View all work',
    'cta.readMore': 'Read more',
    'cta.backHome': 'Back to home',
    'cta.backToTop': 'Back to top',
    'cta.sendMessage': 'Send message',
    'cta.downloadCv': 'Download CV',
    'cta.copyEmail': 'Copy email',
    'cta.emailCopied': 'Email copied',

    // -- Contact form ---------------------------------------------------------
    'form.name.label': 'Name',
    'form.name.placeholder': 'Your name',
    'form.email.label': 'Email',
    'form.email.placeholder': 'you@example.com',
    'form.message.label': 'Message',
    'form.message.placeholder': 'Tell me about your project and how I can help.',
    'form.submit': 'Send message',
    'form.sending': 'Sending…',
    'form.success': 'Message sent. I will get back to you within 48 hours.',
    'form.error': 'Something went wrong. Please try again or email info@marmibas.dev.',
    'form.error.rateLimit': 'Too many messages in a short time. Please wait a few minutes and try again.',
    'form.error.validation': 'Please review the fields and try again.',
    'form.validation.nameRequired': 'Please share your name.',
    'form.validation.nameTooShort': 'Name must be at least 2 characters.',
    'form.validation.emailRequired': 'I need an email to reply.',
    'form.validation.emailInvalid': 'That email does not look valid.',
    'form.validation.messageRequired': 'Let me know how I can help.',
    'form.validation.messageMinLength': 'Message must be at least 10 characters.',
    'form.validation.messageMaxLength': 'Message must be under 2000 characters.',

    // -- Status labels --------------------------------------------------------
    'status.success': 'In production',
    'status.inProduction': 'In production',
    'status.inDevelopment': 'In development',
    'status.sideProject': 'Side project',
    'status.paused': 'Paused',
    'status.prevExperience': 'Previous experience',

    // -- Meta / layout / a11y -------------------------------------------------
    'meta.skipToContent': 'Skip to content',
    'meta.languageSwitcher': 'Switch language',
    'meta.langSwitcherLabel': 'Language',
    'meta.currentLanguage': 'Current language',
    'meta.toggleMenu': 'Open menu',
    'meta.closeMenu': 'Close menu',
    'meta.openExternal': 'Open in new tab',
    'meta.search': 'Search',

    // -- Listing / empty states ----------------------------------------------
    'common.readMore': 'Read more',
    'common.backTo': 'Back to',
    'common.viewProject': 'View project',
    'common.viewCaseStudy': 'View case study',
    'common.publishedOn': 'Published on',
    'common.updatedOn': 'Updated on',
    'common.readingTime': 'min read',
    'common.tableOfContents': 'On this page',
    'toc.label': 'Contents',
    'common.relatedPosts': 'Related posts',
    'common.previousPost': 'Previous post',
    'common.nextPost': 'Next post',
    'common.empty.posts': 'No posts yet. Check back soon.',
    'common.empty.work': 'No projects match the current filters.',
    'common.filters.status': 'Status',
    'common.filters.tag': 'Tech',
    'common.filters.clear': 'Clear filters',
    'common.filters.all': 'All',

    // -- Home: Featured projects (T-30) --------------------------------------
    'featured.heading': 'Success stories',
    'featured.sub': 'Real solutions that are working today in real businesses.',
    'featured.viewAll': 'View all projects →',

    // -- Work index — grid + filtros (T-34) ----------------------------------
    'work.heading': 'Custom software projects',
    'work.tagline':
      'A selection of projects in production, in development and explorations.',
    'work.filter.label': 'Filter by',
    'work.filter.all': 'All',
    'work.filter.success': 'Success stories',
    'work.filter.development': 'In development',
    'work.filter.sideProjects': 'Side projects',
    'work.empty': 'No projects in this category yet.',

    // -- Home: About section (T-31) -------------------------------------------
    'about.heading': 'About me',
    'about.bio.p1':
      "I'm marmibas. I'm a software engineer with 5 years of experience building software for companies of all sizes — from startups to large enterprises.",
    'about.bio.p2':
      'Today I work independently, helping entrepreneurs, freelancers and small businesses digitize their day-to-day. If your business has repetitive tasks that consume your time, error-prone quotes, or information scattered between Excel and WhatsApp, I can help.',
    'about.bio.p3':
      'I work remotely from Spain, with clients anywhere. If you have an idea or a problem you want to solve, get in touch — the first conversation is free and no-strings-attached.',
    'about.stats.years': 'Years of experience',
    'about.stats.yearsValue': '5+',
    'about.stats.projects': 'Live products',
    'about.stats.projectsValue': '2+',
    'about.cta.experience': 'Read the full story',
    'about.cta.contact': "Let's talk",

    // -- Home: Services section (What I do) ----------------------------------
    'services.heading': 'What I do',
    'services.tagline': 'Custom software solutions to grow your business.',
    'services.shop.title': 'Online stores',
    'services.shop.description':
      'Sell your products online with a system that is easy to manage. Orders, stock, secure payments and integrated shipping.',
    'services.management.title': 'Internal management systems',
    'services.management.description':
      'Custom software to run your business: clients, quotes, invoices, calendar — all in one place.',
    'services.mobile.title': 'Mobile applications',
    'services.mobile.description':
      'iOS and Android apps so your team or your customers can work from their phone, wherever they are.',
    'services.automation.title': 'Automations',
    'services.automation.description':
      'Repetitive tasks that drain your hours today — quotes, emails, reports, invoicing. We make them automatic.',
    'services.web.title': 'Corporate websites',
    'services.web.description':
      'Your digital presence ready to win clients: fast, accessible, and well positioned in search engines.',
    'services.integration.title': 'Integrations',
    'services.integration.description':
      'We connect the tools you already use (WhatsApp, email, spreadsheets, ERP) so they stop being separate islands.',

    // -- Experience page (T-35) ----------------------------------------------
    'experience.heading': 'Professional experience',
    'experience.tagline':
      '5 years building software in Valencia-based companies and remote.',
    'experience.disclaimer':
      'Companies listed are previous employers. Today I work independently.',
    'experience.education.heading': 'Education',
    'experience.education.degree': "Bachelor's in Computer Engineering",
    'experience.education.school': 'ETSE Universidad de Valencia',
    'experience.education.years': '2018 — 2023',
    'experience.fallback': 'Experience details only available in Spanish for now.',

    // -- Blog (T-36 / T-37) ---------------------------------------------------
    'blog.heading': 'Notes on software and digitization',
    'blog.tagline': 'Technical notes, decisions and lessons from the road.',
    'blog.empty': 'First post coming soon.',
    'blog.readingTime': '{n} min read',

    // -- 404 ------------------------------------------------------------------
    'notFound.title': 'Page not found',
    'notFound.description':
      'The link is broken or the page has moved. You can head back home or browse the work.',
    'notFound.backHome': 'Back to home',
    'notFound.viewWork': 'View work',
  },
} as const satisfies Record<Language, Record<string, string>>;

/**
 * Tipo del diccionario derivado del shape de ES.
 * Cualquier clave faltante en EN (o viceversa) será detectada por
 * el `satisfies Record<Language, …>` de arriba.
 */
export type UIDictionary = typeof ui.es;
export type UIKey = keyof UIDictionary;
