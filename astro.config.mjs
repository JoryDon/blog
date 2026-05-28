// @ts-check

import db from '@astrojs/db';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import expressive from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  redirects: {
    '/docs/index': '/docs/',
    '/guides/home': '/blog/top/',
    '/life/sanzijing': '/blog/chinese/sanzijing/',
    '/reference/core': '/blog/first/',
    '/reference/js': '/blog/second/',
  },
  integrations: [UnoCSS(), expressive(), mdx(), sitemap(), db()],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['astro-expressive-code']
    },
  },
});