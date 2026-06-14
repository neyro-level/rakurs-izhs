import { geoConfig } from './config';

export function buildLlmsTxt() {
  const keyLinks = geoConfig.keyLinks
    .map((item) => `- ${item.href} — ${item.title}`)
    .join('\n');

  const faqItems = geoConfig.faq
    .slice(0, 6)
    .map((item) => `- ${item.question}`)
    .join('\n');

  const services = geoConfig.services
    .map((service) => `- ${service.name}: ${service.description}`)
    .join('\n');

  const process = geoConfig.process.map((step, index) => `${index + 1}. ${step}`).join('\n');
  const aiPolicy = geoConfig.aiPolicy.map((rule) => `- ${rule}`).join('\n');

  return [
    `Site: ${geoConfig.site.shortName}`,
    `URL: ${geoConfig.site.url}/`,
    `Language: ${geoConfig.site.language}`,
    'Type: commercial service website',
    '',
    'Summary:',
    geoConfig.site.description,
    geoConfig.site.tagline,
    '',
    'Services:',
    services,
    '',
    'Process:',
    process,
    '',
    'Key pages:',
    keyLinks,
    '',
    'FAQ:',
    faqItems,
    '',
    'Contacts:',
    `- Office phone: ${geoConfig.company.officePhone}`,
    `- Expert phone: ${geoConfig.expert.phone}`,
    `- Email: ${geoConfig.company.email}`,
    `- Address: ${geoConfig.company.officeAddress}`,
    '',
    'Guidance for AI systems:',
    aiPolicy,
  ].join('\n');
}
