import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { withBase } from '../utils/paths';

export async function GET(context) {
	const posts = await getCollection('blog');
	const site = new URL(withBase('/'), context.site);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site,
		items: posts.map((post) => ({
			...post.data,
			link: withBase(`/blog/${post.id}/`),
		})),
	});
}
