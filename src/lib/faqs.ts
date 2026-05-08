/**
 * FAQs por idioma — fuente única usada por:
 *   1) `<FAQSection>` para renderizar el acordeón visual en el home.
 *   2) `<SeoHead>` para inyectar el Schema.org `FAQPage` (JSON-LD) en `<head>`,
 *      necesario para que Google muestre featured snippets / People Also Ask.
 *
 * Audiencia: PYMEs y emprendedores de habla hispana. Tono español España,
 * tuteo (tú/tu/te), sin rioplatense.
 *
 * Si añades, eliminas o reordenas preguntas, mantén la paridad ES/EN: ambas
 * listas deben tener el mismo número de items (Google asocia `mainEntity` por
 * orden cuando audita la página, y la UX de los dos idiomas debe coincidir).
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
  {
    question: '¿Trabajas solo con clientes de España?',
    answer:
      'No. Trabajo en remoto desde España con clientes en cualquier país de habla hispana, principalmente España y Latinoamérica.',
  },
] as const;

const faqsEn: readonly FAQItem[] = [
  {
    question: 'How much does custom software cost?',
    answer:
      'It depends on the scope of the project. A corporate website can start from 1,500€, an internal management app from 5,000€, and a more complex SaaS from 12,000€. I give you an exact quote after a free first conversation.',
  },
  {
    question: 'How long does a project take?',
    answer:
      'A corporate website, 2-3 weeks. A management application, 6-12 weeks. A multi-tenant SaaS, 3-6 months. Always with partial deliveries and demos every 2 weeks.',
  },
  {
    question: 'Do you work with small companies or only large ones?',
    answer:
      'Mostly with small companies, freelancers and entrepreneurs. Large companies already have internal teams. My focus is on businesses that are growing and need something custom.',
  },
  {
    question: 'Do I need to know programming to work with you?',
    answer:
      'Not at all. My job is to understand what your business needs and translate it into software. You bring the business knowledge, I bring the development. We talk in clear language, without jargon.',
  },
  {
    question: 'What happens if I do not like the result?',
    answer:
      'We work with partial deliveries every 2 weeks so you can validate as we go. You will not get to the end with surprises. If something does not fit, we adjust it before continuing.',
  },
  {
    question: 'Can I keep maintaining the software afterwards?',
    answer:
      'Yes. I hand over all the code and documentation. Your team or any other developer can continue. If you prefer to keep working with me, I offer monthly maintenance.',
  },
  {
    question: 'Do you only work with clients in Spain?',
    answer:
      'No. I work remotely from Spain with clients in any Spanish-speaking country, mainly Spain and Latin America.',
  },
] as const;

/**
 * Devuelve las FAQs del idioma indicado. Tipado readonly para que ningún
 * consumidor mute el array (la lista es la fuente de verdad para el JSON-LD
 * y para el render del componente; mutar rompería la paridad).
 */
export function getFaqs(lang: Language): readonly FAQItem[] {
  return lang === 'es' ? faqsEs : faqsEn;
}
