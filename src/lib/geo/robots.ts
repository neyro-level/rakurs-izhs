import { geoConfig } from './config';

export function buildRobotsTxt() {
  const disallowLines = geoConfig.crawlerPolicy.disallow
    .map((path) => `Disallow: ${path}`)
    .join('\n');

  const specificBots = geoConfig.crawlerPolicy.allow
    .filter((agent) => agent !== '*')
    .map((agent) => `User-agent: ${agent}\nAllow: /`)
    .join('\n\n');

  return [
    'User-agent: *',
    'Allow: /',
    disallowLines,
    '',
    specificBots,
    '',
    `Sitemap: ${geoConfig.site.url}/sitemap-index.xml`,
  ]
    .filter(Boolean)
    .join('\n');
}
