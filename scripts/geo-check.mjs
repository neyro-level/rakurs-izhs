import { readFile } from 'node:fs/promises';
import path from 'node:path';

const errors = [];
const registryPath = path.join(process.cwd(), 'src/lib/seo/registry.data.json');
const registry = JSON.parse(await readFile(registryPath, 'utf8'));

function fail(message) {
  errors.push(message);
}

async function read(relativePath) {
  return readFile(path.join(process.cwd(), relativePath), 'utf8');
}

function distPathFromRoute(routePath) {
  if (routePath === '/') return 'dist/index.html';
  if (routePath === '/404/' || routePath === '/404.html') return 'dist/404.html';
  return `dist${routePath}index.html`;
}

function expectIncludes(text, needle, message) {
  if (!text.includes(needle)) fail(message);
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

const robotsTxt = await read('dist/robots.txt');
const llmsTxt = await read('dist/llms.txt');

expectIncludes(robotsTxt, 'Allow: /', 'robots.txt must explicitly allow crawling.');
expectIncludes(robotsTxt, 'User-agent: GPTBot', 'robots.txt must explicitly allow GPTBot.');
expectIncludes(robotsTxt, 'User-agent: ChatGPT-User', 'robots.txt must explicitly allow ChatGPT-User.');
expectIncludes(robotsTxt, 'User-agent: ClaudeBot', 'robots.txt must explicitly allow ClaudeBot.');
expectIncludes(robotsTxt, 'User-agent: PerplexityBot', 'robots.txt must explicitly allow PerplexityBot.');
expectIncludes(robotsTxt, 'Sitemap: https://rakurs-izhs.ru/sitemap-index.xml', 'robots.txt must point to the production sitemap.');

expectIncludes(llmsTxt, 'Site: Ракурс ИЖС', 'llms.txt must contain the project name.');
expectIncludes(llmsTxt, '/politika/', 'llms.txt must reference the privacy page.');
expectIncludes(llmsTxt, '/cookies/', 'llms.txt must reference the cookie rules page.');
expectIncludes(llmsTxt, 'Guidance for AI systems:', 'llms.txt must contain AI guidance.');

for (const entry of registry) {
  const html = await read(distPathFromRoute(entry.path));

  if (countMatches(html, /<h1\b/g) !== 1) {
    fail(`${entry.path} must contain exactly one H1.`);
  }

  expectIncludes(
    html,
    '<link rel="alternate" type="text/plain" href="/llms.txt"',
    `${entry.path} must expose llms.txt as an alternate text resource.`
  );

  for (const schemaType of entry.schemaTypes) {
    expectIncludes(html, `"${schemaType}"`, `${entry.path} must include ${schemaType} schema.`);
  }

  if (!entry.schemaTypes.includes('FAQPage') && html.includes('"FAQPage"') && entry.path !== '/') {
    fail(`${entry.path} must not include unexpected FAQPage schema.`);
  }

  if (html.includes('"SearchAction"')) {
    fail(`${entry.path} must not include SearchAction schema without a real search feature.`);
  }

  if (html.includes('example.com') || html.includes('localhost')) {
    fail(`${entry.path} must not contain placeholder domains.`);
  }
}

if (errors.length > 0) {
  console.error('GEO check failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('GEO check passed.');
