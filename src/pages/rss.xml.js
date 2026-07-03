import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { absoluteWithBase } from '../utils/site-url';

export async function GET() {
	const posts = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: absoluteWithBase('/'),
		items: posts.map((post) => ({
			...post.data,
			link: absoluteWithBase(`/blog/${post.id}/`),
		})),
	});
}
