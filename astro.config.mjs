// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import expressive from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [UnoCSS(), expressive(), mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['astro-expressive-code']
    },
  },
});