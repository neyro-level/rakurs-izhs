// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://rakurs-izhs.ru',
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return !['/thanks/', '/sitemap/'].includes(pathname);
      },
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
