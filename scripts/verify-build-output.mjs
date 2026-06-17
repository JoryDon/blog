import { readFile } from 'node:fs/promises';

const SITE = 'https://jinruihub.github.io';
const BASE = '/blog/';
const DIST = new URL('../dist/', import.meta.url);

async function readDistFile(path) {
	return readFile(new URL(path, DIST), 'utf8');
}

function assertIncludes(content, expected, label) {
	if (!content.includes(expected)) {
		throw new Error(`${label}: expected to include ${expected}`);
	}
}

function assertExcludes(content, unexpected, label) {
	if (content.includes(unexpected)) {
		throw new Error(`${label}: must not include ${unexpected}`);
	}
}

function assertMatches(content, pattern, label) {
	if (!pattern.test(content)) {
		throw new Error(`${label}: expected to match ${pattern}`);
	}
}

const [home, blogIndex, docsIndex, rss, sitemapIndex, sitemap] = await Promise.all([
	readDistFile('index.html'),
	readDistFile('blog/index.html'),
	readDistFile('docs/index.html'),
	readDistFile('rss.xml'),
	readDistFile('sitemap-index.xml'),
	readDistFile('sitemap-0.xml'),
]);

for (const [label, content] of [
	['home', home],
	['blog index', blogIndex],
	['docs index', docsIndex],
	['rss', rss],
	['sitemap index', sitemapIndex],
	['sitemap', sitemap],
]) {
	assertExcludes(content, 'https://example.com', label);
}

assertIncludes(home, `href="${BASE}"`, 'home header link');
assertIncludes(home, `href="${BASE}blog"`, 'home blog navigation');
assertIncludes(home, `href="${BASE}docs"`, 'home docs navigation');
assertIncludes(home, `href="${BASE}favicon.svg"`, 'home favicon');
assertIncludes(home, `href="${BASE}sitemap-index.xml"`, 'home sitemap link');
assertIncludes(home, `href="${SITE}${BASE}rss.xml"`, 'home rss link');
assertIncludes(home, `href="${BASE}fonts/atkinson-regular.woff"`, 'home font preload');
assertIncludes(home, `url("${BASE}fonts/atkinson-regular.woff")`, 'home font face');
assertIncludes(home, `href="${SITE}${BASE}"`, 'home canonical');
assertMatches(home, new RegExp(`content="${SITE}${BASE}_astro/[^"]+\\.jpg"`), 'home social image');

assertIncludes(blogIndex, `href="${BASE}blog/chinese/sanzijing/"`, 'blog post link');
assertMatches(blogIndex, new RegExp(`src="${BASE}_astro/[^"]+\\.webp"`), 'blog image asset');

assertIncludes(docsIndex, `href="${BASE}docs/guides/example/"`, 'docs page link');

assertIncludes(rss, `<link>${SITE}${BASE}</link>`, 'rss channel link');
assertIncludes(rss, `<link>${SITE}${BASE}blog/chinese/sanzijing/</link>`, 'rss item link');

assertIncludes(sitemapIndex, `<loc>${SITE}${BASE}sitemap-0.xml</loc>`, 'sitemap index');
assertIncludes(sitemap, `<loc>${SITE}${BASE}blog/chinese/sanzijing/</loc>`, 'sitemap page link');

console.log('Build output URLs are base-aware.');
