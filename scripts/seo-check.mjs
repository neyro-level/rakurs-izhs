import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
const distDir = path.join(process.cwd(), 'dist');
const registryPath = path.join(process.cwd(), 'src/lib/seo/registry.data.json');
const registry = JSON.parse(await readFile(registryPath, 'utf8'));
const errors = [];

function fail(message) {
  errors.push(message);
}

async function exists(relativePath) {
  try {
    await access(path.join(process.cwd(), relativePath));
    return true;
  } catch {
    return false;
  }
}

async function read(relativePath) {
  return readFile(path.join(process.cwd(), relativePath), 'utf8');
}

function expectIncludes(text, needle, message) {
  if (!text.includes(needle)) fail(message);
}

function expectMatch(text, regex, message) {
  if (!regex.test(text)) fail(message);
}

function distPathFromRoute(routePath) {
  if (routePath === '/') return 'dist/index.html';
  if (routePath === '/404/' || routePath === '/404.html') return 'dist/404.html';
  return `dist${routePath}index.html`;
}

async function walkHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkHtml(fullPath)));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

const requiredAssets = [
  'dist/favicon.ico',
  'dist/favicon.svg',
  'dist/favicon-32.png',
  'dist/favicon-16.png',
  'dist/apple-touch-icon.png',
  'dist/og/rakurs-izhs-default.png',
  'dist/robots.txt',
  'dist/llms.txt',
];

for (const asset of requiredAssets) {
  if (!(await exists(asset))) {
    fail(`Missing asset: ${asset}`);
  }
}

const sitemapXml = await read('dist/sitemap-0.xml');

for (const entry of registry) {
  const html = await read(distPathFromRoute(entry.path));
  const titlePattern = new RegExp(`<title>${entry.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`);
  const canonicalPattern = new RegExp(
    `<link rel="canonical" href="${entry.canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*\\/?>`
  );

  expectMatch(html, titlePattern, `Incorrect <title> for ${entry.path}`);
  expectIncludes(
    html,
    `<meta name="description" content="${entry.description}"`,
    `Incorrect description meta for ${entry.path}`
  );
  expectMatch(html, canonicalPattern, `Incorrect canonical for ${entry.path}`);
  expectIncludes(html, entry.ogImage, `Incorrect OG image for ${entry.path}`);
  expectIncludes(html, '/favicon.ico', `${entry.path} must include favicon.ico link.`);
  expectIncludes(html, '/favicon.svg', `${entry.path} must include favicon.svg link.`);
  expectIncludes(html, '/apple-touch-icon.png', `${entry.path} must include apple touch icon link.`);

  if (entry.noindex) {
    expectIncludes(html, 'noindex, nofollow', `${entry.path} must be noindex.`);
  } else {
    expectIncludes(html, 'index, follow', `${entry.path} must be indexable.`);
    if (!sitemapXml.includes(`<loc>${entry.canonical}</loc>`)) {
      fail(`${entry.path} is missing from sitemap.`);
    }
  }
}

if (sitemapXml.includes('/thanks/')) fail('Thanks page must not be present in sitemap.');
if (sitemapXml.includes('<loc>https://rakurs-izhs.ru/sitemap/</loc>')) fail('HTML sitemap page must not be present in sitemap.');
if (sitemapXml.includes('<loc>https://rakurs-izhs.ru/404/</loc>')) fail('404 page must not be present in sitemap.');

const htmlFiles = await walkHtml(distDir);
const blockedSnippets = ['example.com', 'localhost', 'Михаил', 'военная ипотека', '[TODO]', '[DOMAIN]'];

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');

  expectMatch(html, /<title>[\s\S]+<\/title>/, `Missing <title> in ${path.relative(process.cwd(), file)}`);
  expectMatch(html, /<meta name="description" content="[^"]+"/, `Missing description meta in ${path.relative(process.cwd(), file)}`);

  for (const snippet of blockedSnippets) {
    if (html.includes(snippet)) {
      fail(`Blocked snippet "${snippet}" found in ${path.relative(process.cwd(), file)}`);
    }
  }
}

if (errors.length > 0) {
  console.error('SEO check failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('SEO check passed.');
