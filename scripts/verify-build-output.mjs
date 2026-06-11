import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');

function readDist(relativePath) {
	const filePath = join(distDir, relativePath);

	if (!existsSync(filePath)) {
		throw new Error(`Expected build output missing: ${relativePath}`);
	}

	return readFileSync(filePath, 'utf8');
}

function assertIncludes(source, expected, label) {
	if (!source.includes(expected)) {
		throw new Error(`${label} should include ${expected}`);
	}
}

function assertNotMatches(source, pattern, label) {
	if (pattern.test(source)) {
		throw new Error(`${label} should not match ${pattern}`);
	}
}

const home = readDist('index.html');
const blogIndex = readDist('blog/index.html');
const docsIndex = readDist('docs/index.html');
const rss = readDist('rss.xml');
const sitemapIndex = readDist('sitemap-index.xml');
const sitemap = readDist('sitemap-0.xml');

for (const [label, html] of [
	['home page', home],
	['blog index', blogIndex],
	['docs index', docsIndex],
]) {
	assertNotMatches(html, /https:\/\/example\.com/, label);
	assertNotMatches(html, /\{fontFaceStyles\}/, label);
	assertNotMatches(html, /href="\/(?:favicon\.svg|fonts\/|sitemap-index\.xml|rss\.xml)/, label);
	assertNotMatches(html, /href="\/docs(?:\/|")/, label);
	assertIncludes(html, 'href="/blog/favicon.svg"', label);
	assertIncludes(html, 'href="/blog/sitemap-index.xml"', label);
	assertIncludes(html, 'href="/blog/"', label);
	assertIncludes(html, 'href="/blog/blog"', label);
	assertIncludes(html, 'href="/blog/docs"', label);
	assertIncludes(html, 'href="/blog/fonts/atkinson-regular.woff"', label);
	assertIncludes(html, 'href="/blog/fonts/atkinson-bold.woff"', label);
	assertIncludes(html, 'https://jinruihub.github.io/blog/rss.xml', label);
}

assertIncludes(blogIndex, 'href="/blog/blog/first/"', 'blog index');
assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs index');
assertNotMatches(rss, /https:\/\/example\.com/, 'RSS feed');
assertIncludes(rss, 'https://jinruihub.github.io/blog/', 'RSS feed');
assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/first/', 'RSS feed');
assertNotMatches(sitemap, /https:\/\/example\.com/, 'sitemap');
assertNotMatches(sitemapIndex, /https:\/\/example\.com/, 'sitemap index');
assertIncludes(sitemapIndex, 'https://jinruihub.github.io/blog/sitemap-0.xml', 'sitemap index');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/', 'sitemap');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/blog/first/', 'sitemap');

console.log('Build output is base-path aware.');
