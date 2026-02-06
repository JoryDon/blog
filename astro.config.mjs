// @ts-check

import db from '@astrojs/db';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [UnoCSS(), mdx(), sitemap(), db()],

  vite: {
    plugins: [tailwindcss()],
  },
});