import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import compressor from 'astro-compressor';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com', // ЗАМЕНИТЬ на домен клиента
  output: 'static',
  adapter: vercel(),
  
  integrations: [
    react(),
    sitemap(),
    compressor({ gzip: true, brotli: true }),
  ],
  
  vite: {
    plugins: [tailwindcss()],
  },
  
  image: {
    domains: [],
  },
  
  build: {
    inlineStylesheets: 'auto',
  },
  
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
