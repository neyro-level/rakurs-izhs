import { geoConfig } from './config';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: geoConfig.site.name,
    url: `${geoConfig.site.url}/`,
    email: geoConfig.company.email,
    telephone: geoConfig.company.officePhone,
    sameAs: [geoConfig.company.vk],
    address: {
      '@type': 'PostalAddress',
      ...geoConfig.company.postalAddress,
    },
  };
}

export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: geoConfig.site.shortName,
    url: `${geoConfig.site.url}/`,
    inLanguage: geoConfig.site.language,
  };
}

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: geoConfig.expert.name,
    jobTitle: geoConfig.expert.role,
    telephone: geoConfig.expert.phone,
    worksFor: {
      '@type': 'Organization',
      name: geoConfig.site.name,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: geoConfig.company.postalAddress.addressLocality,
      addressCountry: geoConfig.company.postalAddress.addressCountry,
    },
  };
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: geoConfig.site.name,
    url: `${geoConfig.site.url}/`,
    telephone: geoConfig.company.officePhone,
    email: geoConfig.company.email,
    image: geoConfig.site.ogImage,
    address: {
      '@type': 'PostalAddress',
      ...geoConfig.company.postalAddress,
    },
    areaServed: geoConfig.site.region,
  };
}

export function serviceSchema(overrides?: {
  name?: string;
  description?: string;
  path?: string;
  areaServed?: string;
}) {
  const service = geoConfig.services[0];

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: overrides?.name ?? service.name,
    description: overrides?.description ?? service.description,
    url: new URL(overrides?.path ?? service.path, geoConfig.site.url).toString(),
    provider: {
      '@type': 'Organization',
      name: geoConfig.site.name,
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: overrides?.areaServed ?? service.areaServed,
    },
  };
}

export function faqSchema(
  faqItems: Array<{
    question: string;
    answer: string;
  }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
