export const spanishServices = [
  {
    key: 'shop',
    slug: 'tiendas-online',
    title: 'Tiendas online a medida',
    description:
      'E-commerce con pasarelas de pago, stock, envíos y panel propio para vender sin pelearte con plantillas.',
    keyword: 'E-commerce',
    iconName: 'shopping-bag',
  },
  {
    key: 'management',
    slug: 'sistemas-de-gestion',
    title: 'Sistemas de gestión',
    description:
      'Software interno para llevar clientes, presupuestos, facturas y calendario en un único sitio.',
    keyword: 'Backoffice',
    iconName: 'layout-dashboard',
  },
  {
    key: 'mobile',
    slug: 'aplicaciones-moviles',
    title: 'Aplicaciones móviles',
    description:
      'Apps iOS y Android para empleados o clientes, con publicación en stores incluida.',
    keyword: 'Mobile',
    iconName: 'smartphone',
  },
  {
    key: 'automation',
    slug: 'automatizaciones',
    title: 'Automatizaciones',
    description:
      'Tareas repetitivas que se ejecutan solas: presupuestos, emails, informes, facturación.',
    keyword: 'Procesos',
    iconName: 'zap',
  },
  {
    key: 'web',
    slug: 'webs-corporativas',
    title: 'Webs corporativas',
    description:
      'Webs rápidas, accesibles y bien posicionadas en buscadores, sin plantillas genéricas.',
    keyword: 'Web',
    iconName: 'globe',
  },
  {
    key: 'webApp',
    slug: 'desarrollo-aplicaciones-web',
    title: 'Desarrollo de aplicaciones web',
    description:
      'Plataformas web a medida para clientes o equipos: accesibles desde el navegador, seguras y preparadas para crecer.',
    keyword: 'Aplicaciones web',
    iconName: 'layout-dashboard',
  },
  {
    key: 'integration',
    slug: 'integraciones',
    title: 'Integraciones',
    description:
      'Conexiones entre WhatsApp, ERP, hojas de cálculo, email y demás herramientas que ya usas.',
    keyword: 'Conexión',
    iconName: 'plug-zap',
  },
] as const;

export const spanishServicePaths = new Set(
  spanishServices.map((service) => `/servicios/${service.slug}`)
);

export function isSpanishServicePath(pathname: string): boolean {
  return spanishServicePaths.has(pathname.replace(/\/$/, ''));
}
