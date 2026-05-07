/**
 * Diccionarios UI compartidos (ES/EN).
 *
 * - ES es el idioma por defecto (sin prefijo de URL).
 * - EN vive bajo `/en` (audiencia técnica internacional, tono profesional).
 * - ES está pensado para PYMEs LATAM/ES: tono cercano, claro, sin jerga ni
 *   formalismos vacíos. Tutea, no usa "usted".
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
    'footer.builtWith': 'Hecho con Astro',
    'footer.copyright': 'marmibas',
    'footer.rss': 'RSS',
    'footer.madeWith': 'Hecho con',
    'footer.social.github': 'GitHub',
    'footer.social.linkedin': 'LinkedIn',
    'footer.social.twitter': 'X (Twitter)',
    'footer.social.email': 'Email',

    // -- Botones / CTAs -------------------------------------------------------
    'cta.contact': 'Hablemos',
    'cta.viewWork': 'Ver trabajos',
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
    'form.message.placeholder': 'Contame en qué andás y cómo puedo ayudarte',
    'form.submit': 'Enviar mensaje',
    'form.sending': 'Enviando…',
    'form.success': 'Mensaje enviado. Te respondo en menos de 48 h.',
    'form.error': 'Algo salió mal. Probá de nuevo o escribime a marmibas.dev@gmail.com.',
    'form.error.rateLimit': 'Has enviado varios mensajes seguidos. Esperá unos minutos y volvé a intentarlo.',
    'form.error.validation': 'Revisá los campos y volvé a enviar.',
    'form.validation.nameRequired': 'Decime cómo te llamás.',
    'form.validation.nameTooShort': 'El nombre debe tener al menos 2 caracteres.',
    'form.validation.emailRequired': 'Necesito un email para responderte.',
    'form.validation.emailInvalid': 'El email no parece válido.',
    'form.validation.messageRequired': 'Contame en qué puedo ayudarte.',
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
    'common.relatedPosts': 'Posts relacionados',
    'common.previousPost': 'Post anterior',
    'common.nextPost': 'Post siguiente',
    'common.empty.posts': 'Aún no hay publicaciones. Volvé pronto.',
    'common.empty.work': 'No hay proyectos que coincidan con los filtros.',
    'common.filters.status': 'Estado',
    'common.filters.tag': 'Tecnología',
    'common.filters.clear': 'Limpiar filtros',
    'common.filters.all': 'Todos',

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
    'footer.builtWith': 'Built with Astro',
    'footer.copyright': 'marmibas',
    'footer.rss': 'RSS',
    'footer.madeWith': 'Made with',
    'footer.social.github': 'GitHub',
    'footer.social.linkedin': 'LinkedIn',
    'footer.social.twitter': 'X (Twitter)',
    'footer.social.email': 'Email',

    // -- Buttons / CTAs -------------------------------------------------------
    'cta.contact': "Let's talk",
    'cta.viewWork': 'View work',
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
    'form.error': 'Something went wrong. Please try again or email marmibas.dev@gmail.com.',
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
    'common.relatedPosts': 'Related posts',
    'common.previousPost': 'Previous post',
    'common.nextPost': 'Next post',
    'common.empty.posts': 'No posts yet. Check back soon.',
    'common.empty.work': 'No projects match the current filters.',
    'common.filters.status': 'Status',
    'common.filters.tag': 'Tech',
    'common.filters.clear': 'Clear filters',
    'common.filters.all': 'All',

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
