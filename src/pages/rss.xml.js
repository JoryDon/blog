import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { absoluteRouteWithBase, absoluteWithBase } from '../utils/site-url';

export async function GET(context) {
	const posts = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: absoluteWithBase('/', context.site).toString(),
		items: posts.map((post) => ({
			...post.data,
			link: absoluteRouteWithBase(`/blog/${post.id}/`, context.site).toString(),
		})),
	});
}
