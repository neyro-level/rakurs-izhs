// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercel({
    imageService: true,
  }),
  site: 'https://an-rakurs.ru',
  integrations: [
    sitemap(),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
