// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Jory',
			social: {
				github: 'https://gitcode.com/Jin-rui/blog',
			},
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
