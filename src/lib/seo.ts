import { SITE, COMPANY, EXPERT } from './constants';

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: `${SITE.url}/`,
  telephone: COMPANY.officePhone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. Чернышевского, 28, этаж 1',
    addressLocality: 'Пермь',
    addressCountry: 'RU',
  },
  sameAs: [COMPANY.vk],
};

export const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: EXPERT.name,
  jobTitle: EXPERT.role,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Пермь',
    addressCountry: 'RU',
  },
};

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
