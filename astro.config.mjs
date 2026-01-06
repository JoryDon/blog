// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: '希东',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://gitcode.com/Jin-rui/blog',
				}
			],
			sidebar: [
				{
					label: '指南',
					items: [
						{ label: '简介', slug: 'guides/home' },
					],
				},
				{
					label: '浮生',
					autogenerate: { directory: 'life' },
				},
				{
					label: '技术',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
