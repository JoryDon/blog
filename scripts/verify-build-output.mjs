import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);

function readDistFile(path) {
	const filePath = join(distDir.pathname, path);
	if (!existsSync(filePath)) {
		throw new Error(`Expected build output file ${path} to exist`);
	}

	return readFileSync(filePath, 'utf8');
}

function assertContains(content, expected, label) {
	if (!content.includes(expected)) {
		throw new Error(`Expected ${label} to contain ${expected}`);
	}
}

function assertNotContains(content, unexpected, label) {
	if (content.includes(unexpected)) {
		throw new Error(`Expected ${label} not to contain ${unexpected}`);
	}
}

function assertNotMatches(content, pattern, label) {
	if (pattern.test(content)) {
		throw new Error(`Expected ${label} not to match ${pattern}`);
	}
}

const home = readDistFile('index.html');
const blogIndex = readDistFile('blog/index.html');
const docsIndex = readDistFile('docs/index.html');
const rss = readDistFile('rss.xml');
const sitemapIndex = readDistFile('sitemap-index.xml');
const sitemap = readDistFile('sitemap-0.xml');

const htmlFiles = [
	['home', home],
	['blog index', blogIndex],
	['docs index', docsIndex],
];

for (const [label, content] of htmlFiles) {
	assertNotContains(content, 'https://example.com', label);
	assertContains(content, 'href="/blog/favicon.svg"', label);
	assertContains(content, 'href="/blog/fonts/atkinson-regular.woff"', label);
	assertContains(content, 'url("/blog/fonts/atkinson-regular.woff")', label);
	assertContains(content, 'href="/blog/sitemap-index.xml"', label);
	assertContains(content, 'href="https://jinruihub.github.io/blog/rss.xml"', label);
	assertNotMatches(content, /\b(?:href|src)="\/(?:favicon\.svg|fonts\/|_astro\/)/, label);
	assertNotContains(content, 'href="/rss.xml"', label);
	assertNotContains(content, 'href="/sitemap-index.xml"', label);
}

assertContains(home, 'href="https://jinruihub.github.io/blog/"', 'home canonical');
assertContains(home, 'href="/blog/blog"', 'home blog navigation');
assertContains(home, 'href="/blog/docs"', 'home docs navigation');

assertContains(blogIndex, 'href="/blog/blog/first/"', 'blog index first post link');
assertContains(blogIndex, 'href="/blog/blog/chinese/sanzijing/"', 'blog index nested post link');
assertNotContains(blogIndex, 'href="/blog/first/"', 'blog index');

assertContains(docsIndex, 'href="/blog/docs/guides/example/"', 'docs index guide link');
assertContains(docsIndex, 'href="/blog/docs/reference/example/"', 'docs index reference link');
assertNotContains(docsIndex, 'href="/docs/guides/example/"', 'docs index');

assertNotContains(rss, 'https://example.com', 'RSS');
assertContains(rss, 'https://jinruihub.github.io/blog/blog/first/', 'RSS first post link');
assertContains(rss, 'https://jinruihub.github.io/blog/blog/chinese/sanzijing/', 'RSS nested post link');
assertNotContains(rss, 'https://jinruihub.github.io/blog/first/', 'RSS');

for (const [label, content] of [
	['sitemap index', sitemapIndex],
	['sitemap', sitemap],
]) {
	assertNotContains(content, 'https://example.com', label);
	assertContains(content, 'https://jinruihub.github.io/blog/', label);
}

assertContains(sitemap, 'https://jinruihub.github.io/blog/blog/', 'sitemap blog index');
assertContains(sitemap, 'https://jinruihub.github.io/blog/blog/first/', 'sitemap first post');
assertContains(sitemap, 'https://jinruihub.github.io/blog/docs/', 'sitemap docs index');

console.log('Build output uses the GitHub Pages /blog/ base path correctly.');
