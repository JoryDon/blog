import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);

function readDist(path) {
	const filePath = join(distDir.pathname, path);

	if (!existsSync(filePath)) {
		throw new Error(`Expected build output ${path} to exist.`);
	}

	return readFileSync(filePath, 'utf8');
}

function assertContains(content, expected, context) {
	if (!content.includes(expected)) {
		throw new Error(`Expected ${context} to contain ${expected}.`);
	}
}

function assertNotContains(content, unexpected, context) {
	if (content.includes(unexpected)) {
		throw new Error(`Expected ${context} not to contain ${unexpected}.`);
	}
}

function assertNoRootLocalUrls(content, context) {
	const rootLocalUrl = /\b(?:href|src)="\/(?!blog(?:\/|"))/;

	if (rootLocalUrl.test(content)) {
		throw new Error(`Expected ${context} not to contain root-relative local href/src URLs.`);
	}
}

const home = readDist('index.html');
const blogIndex = readDist('blog/index.html');
const docsIndex = readDist('docs/index.html');
const firstPost = readDist('blog/first/index.html');
const rss = readDist('rss.xml');
const sitemapIndex = readDist('sitemap-index.xml');
const sitemap = readDist('sitemap-0.xml');

for (const [context, content] of [
	['home page', home],
	['blog index', blogIndex],
	['docs index', docsIndex],
	['first post', firstPost],
	['RSS feed', rss],
	['sitemap index', sitemapIndex],
	['sitemap', sitemap],
]) {
	assertNotContains(content, 'https://example.com', context);
}

for (const [context, content] of [
	['home page', home],
	['blog index', blogIndex],
	['docs index', docsIndex],
	['first post', firstPost],
]) {
	assertContains(content, 'href="/blog/"', context);
	assertContains(content, 'href="/blog/blog/"', context);
	assertContains(content, 'href="/blog/docs/"', context);
	assertContains(content, 'href="/blog/favicon.svg"', context);
	assertContains(content, 'href="/blog/sitemap-index.xml"', context);
	assertContains(content, 'href="/blog/fonts/atkinson-regular.woff"', context);
	assertContains(content, 'href="/blog/fonts/atkinson-bold.woff"', context);
	assertContains(content, 'url("/blog/fonts/atkinson-regular.woff")', context);
	assertContains(content, 'url("/blog/fonts/atkinson-bold.woff")', context);
	assertNoRootLocalUrls(content, context);
}

assertContains(home, 'href="https://jinruihub.github.io/blog/"', 'home canonical');
assertContains(blogIndex, 'href="/blog/blog/first/"', 'blog index post link');
assertContains(docsIndex, 'href="/blog/docs/guides/example/"', 'docs index doc link');
assertContains(firstPost, 'href="/blog/_astro/', 'first post CSS asset');
assertContains(firstPost, 'src="/blog/_astro/', 'first post JS asset');
assertContains(firstPost, 'href="https://jinruihub.github.io/blog/blog/first/"', 'first post canonical');
assertContains(rss, '<link>https://jinruihub.github.io/blog/</link>', 'RSS channel link');
assertContains(rss, '<link>https://jinruihub.github.io/blog/blog/first/</link>', 'RSS item link');
assertContains(sitemapIndex, 'https://jinruihub.github.io/blog/sitemap-0.xml', 'sitemap index');
assertContains(sitemap, 'https://jinruihub.github.io/blog/blog/first/', 'sitemap URL');

console.log('Build output is base-path safe for GitHub Pages /blog/.');
