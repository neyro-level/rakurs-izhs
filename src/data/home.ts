import logoImage from '@/assets/logo-rakurs-izhs-white.png';
import { homeFaqItems } from '@/data/home-faq';
import { geoConfig } from '@/lib/geo/config';
import {
  faqSchema,
  localBusinessSchema,
  organizationSchema,
  personSchema,
  serviceSchema,
  webSiteSchema,
} from '@/lib/geo/schema';

export const jsonLd = [
  {
    ...organizationSchema(),
    logo: `${geoConfig.site.url}${logoImage.src}`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: geoConfig.company.officePhone,
      contactType: 'customer service',
    },
  },
  webSiteSchema(),
  personSchema(),
  localBusinessSchema(),
  serviceSchema(),
  faqSchema(homeFaqItems),
];
