/**
 * FAQs — fuente única usada por:
 *   1) `<FAQSection>` para renderizar el acordeón visual en el home.
 *   2) `<SeoHead>` para inyectar el Schema.org `FAQPage` (JSON-LD) en `<head>`,
 *      necesario para que Google muestre featured snippets / People Also Ask.
 *
 * Audiencia: PYMEs y emprendedores de habla hispana. Tono español España,
 * tuteo (tú/tu/te), sin rioplatense.
 *
 * ES es el único idioma publicado (ver `src/i18n/ui.ts`); `getFaqs` mantiene
 * su parámetro `lang` por consistencia con el resto del layer de i18n, listo
 * para reintroducir una segunda lista si se añade un idioma en el futuro.
 */
import type { Language } from '../i18n/ui';

export interface FAQItem {
  /** Pregunta tal como la formula un cliente potencial. */
  question: string;
  /** Respuesta corta (1-3 frases). El texto es plano, sin HTML. */
  answer: string;
}

const faqsEs: readonly FAQItem[] = [
  {
    question: '¿Cuánto cuesta un software a medida?',
    answer:
      'Depende del alcance del proyecto. Una web corporativa puede empezar desde 1.500€, una aplicación de gestión interna desde 5.000€, y un SaaS más complejo desde 12.000€. Te doy un presupuesto exacto tras una primera conversación gratuita.',
  },
  {
    question: '¿Cuánto tarda un proyecto?',
    answer:
      'Una web corporativa, 2-3 semanas. Una aplicación de gestión, 6-12 semanas. Un SaaS multi-tenant, 3-6 meses. Siempre con entregas parciales y demos cada 2 semanas.',
  },
  {
    question: '¿Trabajas con empresas pequeñas o solo grandes?',
    answer:
      'Sobre todo con pequeñas empresas, autónomos y emprendedores. Las grandes compañías ya tienen equipos internos. Mi foco son los negocios que están creciendo y necesitan algo a medida.',
  },
  {
    question: '¿Tengo que saber de programación para trabajar contigo?',
    answer:
      'Para nada. Mi trabajo es entender lo que necesita tu negocio y traducirlo a software. Tú aportas el conocimiento del negocio, yo aporto el desarrollo. Hablamos en lenguaje claro, sin tecnicismos.',
  },
  {
    question: '¿Qué pasa si no me gusta el resultado?',
    answer:
      'Trabajamos con entregas parciales cada 2 semanas para que vayas validando. No vas a llegar al final con sorpresas. Si algo no encaja, lo ajustamos antes de continuar.',
  },
  {
    question: '¿Puedo seguir manteniendo el software después?',
    answer:
      'Sí. Te entrego todo el código y la documentación. Tu equipo o cualquier otro desarrollador puede continuar. Si prefieres seguir conmigo, ofrezco mantenimiento mensual.',
  },
] as const;

/**
 * Devuelve las FAQs del idioma indicado. Tipado readonly para que ningún
 * consumidor mute el array (la lista es la fuente de verdad para el JSON-LD
 * y para el render del componente).
 */
export function getFaqs(_lang: Language): readonly FAQItem[] {
  return faqsEs;
}
