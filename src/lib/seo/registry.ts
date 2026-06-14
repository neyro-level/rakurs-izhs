import registryData from './registry.data.json';

export type SeoSearchIntent =
  | 'commercial'
  | 'navigational'
  | 'informational'
  | 'legal'
  | 'technical';

export type SeoPriority = 'critical' | 'high' | 'medium' | 'low';

export interface SeoRegistryEntry {
  path: string;
  routeFile: string;
  title: string;
  description: string;
  h1: string;
  canonical: string;
  ogImage: string;
  noindex: boolean;
  schemaTypes: string[];
  cluster: string;
  searchIntent: SeoSearchIntent;
  priority: SeoPriority;
  lastReviewed: string;
}

export const seoRegistry = registryData as SeoRegistryEntry[];

export function getSeoEntry(pathname: string) {
  return seoRegistry.find((entry) => entry.path === pathname);
}

export function requireSeoEntry(pathname: string) {
  const entry = getSeoEntry(pathname);

  if (!entry) {
    throw new Error(`SEO registry entry is missing for pathname: ${pathname}`);
  }

  return entry;
}
