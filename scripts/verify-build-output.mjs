import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);

function distPath(...parts) {
	return join(distDir.pathname, ...parts);
}

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function readDistFile(...parts) {
	const filePath = distPath(...parts);
	assert(existsSync(filePath), `Missing build output: ${parts.join('/')}`);
	return readFileSync(filePath, 'utf8');
}

function assertIncludes(content, expected, label) {
	assert(
		content.includes(expected),
		`${label} should include ${JSON.stringify(expected)}`,
	);
}

function assertExcludes(content, unexpected, label) {
	assert(
		!content.includes(unexpected),
		`${label} should not include ${JSON.stringify(unexpected)}`,
	);
}

const home = readDistFile('index.html');
const blogIndex = readDistFile('blog', 'index.html');
const docsIndex = readDistFile('docs', 'index.html');
const firstPost = readDistFile('blog', 'first', 'index.html');
const docsPost = readDistFile('docs', 'reference', 'example', 'index.html');
const rss = readDistFile('rss.xml');
const sitemapIndex = readDistFile('sitemap-index.xml');
const sitemap = readDistFile('sitemap-0.xml');

const htmlFiles = [
	['home page', home],
	['blog index', blogIndex],
	['docs index', docsIndex],
	['first blog post', firstPost],
	['docs post', docsPost],
];

for (const [label, content] of htmlFiles) {
	assertIncludes(content, 'href="/blog/favicon.svg"', label);
	assertIncludes(content, 'href="/blog/fonts/atkinson-regular.woff"', label);
	assertIncludes(content, 'href="/blog/fonts/atkinson-bold.woff"', label);
	assertIncludes(content, 'href="/blog/"', label);
	assertIncludes(content, 'href="/blog/blog"', label);
	assertIncludes(content, 'href="/blog/docs"', label);
	assertIncludes(content, 'https://jinruihub.github.io/blog/', label);
	assertExcludes(content, 'https://example.com', label);
	assertExcludes(content, 'href="/favicon.svg"', label);
	assertExcludes(content, 'href="/fonts/', label);
	assertExcludes(content, 'href="/docs"', label);
	assertExcludes(content, 'href="/rss.xml"', label);
	assertExcludes(content, 'href="/sitemap-index.xml"', label);
}

assertIncludes(blogIndex, 'href="/blog/blog/first/"', 'blog index');
assertIncludes(blogIndex, 'href="/blog/blog/chinese/sanzijing/"', 'blog index');
assertIncludes(docsIndex, 'href="/blog/docs/reference/example/"', 'docs index');
assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/first/', 'RSS feed');
assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/chinese/sanzijing/', 'RSS feed');
assertExcludes(rss, 'https://example.com', 'RSS feed');
assertIncludes(sitemapIndex, 'https://jinruihub.github.io/blog/sitemap-0.xml', 'sitemap index');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/', 'sitemap');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/blog/first/', 'sitemap');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/docs/reference/example/', 'sitemap');
assertExcludes(sitemap, 'https://example.com', 'sitemap');

console.log('Build output uses the GitHub Pages /blog/ base path.');
