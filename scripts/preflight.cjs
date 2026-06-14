#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const failures = [];

function resolve(rel) {
  return path.join(root, rel);
}

function exists(rel) {
  return fs.existsSync(resolve(rel));
}

function read(rel) {
  return fs.readFileSync(resolve(rel), 'utf8');
}

function fail(message) {
  failures.push(message);
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(resolve(dir), { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', '.astro'].includes(entry.name)) continue;
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(rel, acc);
    } else {
      acc.push(rel);
    }
  }
  return acc;
}

const requiredFiles = [
  'astro.config.mjs',
  'src/layouts/BaseLayout.astro',
  'src/lib/seo.ts',
  'src/lib/seo/registry.data.json',
  'src/lib/seo/registry.ts',
  'src/lib/geo/config.ts',
  'src/lib/geo/schema.ts',
  'src/lib/geo/robots.ts',
  'src/lib/geo/llms.ts',
  'src/lib/analytics.ts',
  'src/lib/validation.ts',
  'src/pages/robots.txt.ts',
  'src/pages/llms.txt.ts',
  'scripts/geo-check.mjs',
  'scripts/seo-check.mjs',
  'public/favicon.ico',
  'public/favicon.svg',
  'public/favicon-32.png',
  'public/favicon-16.png',
  'public/apple-touch-icon.png',
  'public/og/rakurs-izhs-default.png',
  '.github/workflows/deploy-ams.yml',
  '.env.example',
];

for (const file of requiredFiles) {
  if (!exists(file)) {
    fail(`Missing required file: ${file}`);
  }
}

if (exists('public/robots.txt')) {
  fail('Static public/robots.txt must not exist. Use src/pages/robots.txt.ts.');
}

const envExample = exists('.env.example') ? read('.env.example') : '';
for (const key of [
  'PUBLIC_YM_COUNTER_ID=',
  'PUBLIC_LEADS_API_URL=',
  'PUBLIC_PROJECT_ID=',
  'PUBLIC_LEADS_SITE_KEY=',
]) {
  if (!envExample.includes(key)) {
    fail(`.env.example must contain ${key}`);
  }
}

for (const line of envExample.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  if (!/^[A-Z0-9_]+=$/.test(trimmed)) {
    fail(`.env.example values must stay empty: ${trimmed}`);
  }
}

const astroConfig = exists('astro.config.mjs') ? read('astro.config.mjs') : '';
if (astroConfig.includes('example.com')) {
  fail('astro.config.mjs must not contain example.com.');
}
if (!astroConfig.includes('@astrojs/partytown') || !astroConfig.includes("forward: ['ym']")) {
  fail('astro.config.mjs must include @astrojs/partytown with forwarded ym transport.');
}

const registry = JSON.parse(read('src/lib/seo/registry.data.json'));
for (const route of ['/', '/politika/', '/cookies/', '/thanks/', '/404/', '/sitemap/']) {
  if (!registry.some((entry) => entry.path === route)) {
    fail(`SEO registry is missing route: ${route}`);
  }
}

const baseLayout = read('src/layouts/BaseLayout.astro');
for (const snippet of [
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-32.png',
  '/favicon-16.png',
  '/apple-touch-icon.png',
  '/llms.txt',
  'ym-counter-id',
  'rakursInitAnalytics',
  'ModalShell client:load',
  'CookieBanner client:idle',
]) {
  if (!baseLayout.includes(snippet)) {
    fail(`BaseLayout is missing required snippet: ${snippet}`);
  }
}

const scanTargets = [
  ...walk('src'),
  ...walk('public').filter((file) => !/\.(png|jpg|jpeg|webp|ico)$/i.test(file)),
  'astro.config.mjs',
  'package.json',
];

const blockedSnippets = [
  'example.com',
  'localhost:',
  '[TODO]',
  '[DOMAIN]',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'PUBLIC_TELEGRAM_BOT_TOKEN',
  'PUBLIC_CRM_TOKEN',
  'PUBLIC_AMOCRM_WEBHOOK',
  'PUBLIC_BITRIX_WEBHOOK',
];

for (const file of scanTargets) {
  const content = read(file);
  for (const snippet of blockedSnippets) {
    if (content.includes(snippet)) {
      fail(`Blocked snippet "${snippet}" found in ${file}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Preflight failed:\n');
  for (const item of failures) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log('Preflight passed.');
