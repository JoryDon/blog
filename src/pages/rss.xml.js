import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { absoluteRouteWithBase } from '../utils/site-url';

export async function GET(context) {
	const posts = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: absoluteRouteWithBase('/', context.site),
		items: posts.map((post) => ({
			...post.data,
			link: absoluteRouteWithBase(`/blog/${post.id}/`, context.site),
		})),
	});
}
