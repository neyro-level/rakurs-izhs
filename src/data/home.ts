import { COMPANY, EXPERT, SITE } from '@/lib/constants';
import logoImage from '@/assets/logo-rakurs-izhs-white.png';

export const faqItems = [
  {
    q: 'Ракурс сам строит дома?',
    a: 'Нет. Ракурс не строительная компания. Ракурс помогает до договора разобраться со сценарием: ипотека, участок, подрядчик, смета и возможные расходы.',
  },
  {
    q: 'Почему для клиента без отдельной оплаты?',
    a: 'Клиент не платит Ракурс отдельно. Вознаграждение выплачивает подрядчик после сделки.',
  },
  {
    q: 'Можно ли построить дом по семейной ипотеке 6%?',
    a: 'Иногда да, но это зависит от требований банка, участка, подрядчика, договора, сметы и эскроу. Условия нужно проверять на дату обращения.',
  },
  {
    q: 'Что я получу после разбора?',
    a: 'Понимание следующего шага: что проверить по ипотеке, участку, смете и подрядчику, где могут быть риски и какие вопросы задать до договора.',
  },
  {
    q: 'Можно ли обратиться без участка?',
    a: 'Да. Можно начать с бюджета, ипотечного сценария и требований к участку.',
  },
  {
    q: 'Можно ли разобрать уже полученную смету?',
    a: 'Да. Можно посмотреть, что входит в цену, чего не хватает и где могут появиться доплаты после подписания договора.',
  },
  {
    q: 'Что будет после заявки?',
    a: 'Артемий Никулин свяжется, уточнит этап, бюджет, участок, ипотеку или смету и предложит понятный следующий шаг.',
  },
];

export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
      logo: `${SITE.url}${logoImage.src}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'ул. Чернышевского, 28, этаж 1',
        addressLocality: 'Пермь',
        addressCountry: 'RU',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: COMPANY.officePhone,
        contactType: 'customer service',
      },
    },
    {
      '@type': 'WebSite',
      name: SITE.shortName,
      url: SITE.url,
    },
    {
      '@type': 'Person',
      name: EXPERT.name,
      jobTitle: EXPERT.role,
      worksFor: { '@type': 'Organization', name: SITE.name },
    },
    {
      '@type': 'Service',
      name: 'Разбор сценария дома',
      provider: { '@type': 'Organization', name: SITE.name },
      areaServed: { '@type': 'City', name: 'Пермь' },
      description: SITE.description,
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqItems.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    },
  ],
};
