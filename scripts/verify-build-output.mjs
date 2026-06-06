import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const site = 'https://jinruihub.github.io';
const base = '/blog/';

function readDistFile(path) {
	const filePath = join(dist.pathname, path);
	if (!existsSync(filePath)) {
		throw new Error(`Expected build output to contain ${path}`);
	}

	return readFileSync(filePath, 'utf8');
}

function assertIncludes(content, expected, label) {
	if (!content.includes(expected)) {
		throw new Error(`${label} should include ${expected}`);
	}
}

function assertNotIncludes(content, unexpected, label) {
	if (content.includes(unexpected)) {
		throw new Error(`${label} should not include ${unexpected}`);
	}
}

const home = readDistFile('blog/index.html');
const blogIndex = readDistFile('blog/blog/index.html');
const docsIndex = readDistFile('blog/docs/index.html');
const firstPost = readDistFile('blog/blog/first/index.html');
const rss = readDistFile('blog/rss.xml');
const sitemap = readDistFile('blog/sitemap-0.xml');

for (const [label, content] of [
	['home', home],
	['blog index', blogIndex],
	['docs index', docsIndex],
	['first post', firstPost],
]) {
	assertIncludes(content, 'href="/blog/"', label);
	assertIncludes(content, 'href="/blog/blog/"', label);
	assertIncludes(content, 'href="/blog/docs/"', label);
	assertIncludes(content, 'href="/blog/favicon.svg"', label);
	assertIncludes(content, 'href="/blog/fonts/atkinson-regular.woff"', label);
	assertIncludes(content, 'href="/blog/fonts/atkinson-bold.woff"', label);
	assertIncludes(content, 'url("/blog/fonts/atkinson-regular.woff")', label);
	assertIncludes(content, 'url("/blog/fonts/atkinson-bold.woff")', label);
	assertNotIncludes(content, 'https://example.com', label);
	assertNotIncludes(content, 'href="/fonts/', label);
	assertNotIncludes(content, 'url("/fonts/', label);
	assertNotIncludes(content, 'href="/favicon.svg"', label);
}

assertIncludes(blogIndex, 'href="/blog/blog/first/"', 'blog index');
assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs index');
assertIncludes(home, `href="${site}${base}rss.xml"`, 'home RSS link');
assertIncludes(home, `href="${site}${base}"`, 'home canonical URL');
assertIncludes(rss, `<link>${site}${base}</link>`, 'RSS channel');
assertIncludes(rss, `<link>${site}/blog/blog/first/</link>`, 'RSS item link');
assertNotIncludes(rss, 'https://example.com', 'RSS feed');
assertIncludes(sitemap, `<loc>${site}/blog/</loc>`, 'sitemap');
assertIncludes(sitemap, `<loc>${site}/blog/blog/first/</loc>`, 'sitemap');

for (const assetPath of [
	'blog/favicon.svg',
	'blog/fonts/atkinson-regular.woff',
	'blog/fonts/atkinson-bold.woff',
]) {
	if (!existsSync(join(dist.pathname, assetPath))) {
		throw new Error(`Expected asset at ${assetPath}`);
	}
}

console.log('Build output is base-path safe.');
