import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');

function readDist(relativePath) {
	const filePath = join(dist, relativePath);
	if (!existsSync(filePath)) {
		throw new Error(`Expected build output to exist: ${relativePath}`);
	}

	return readFileSync(filePath, 'utf8');
}

function assertIncludes(content, expected, label) {
	if (!content.includes(expected)) {
		throw new Error(`${label} is missing expected content: ${expected}`);
	}
}

function assertExcludes(content, unexpected, label) {
	if (content.includes(unexpected)) {
		throw new Error(`${label} still contains unexpected content: ${unexpected}`);
	}
}

const index = readDist('index.html');
const blogIndex = readDist('blog/index.html');
const docsIndex = readDist('docs/index.html');
const rss = readDist('rss.xml');
const sitemapIndex = readDist('sitemap-index.xml');
const sitemap = readDist('sitemap-0.xml');

for (const [label, content] of [
	['home page', index],
	['blog index', blogIndex],
	['docs index', docsIndex],
	['rss feed', rss],
	['sitemap index', sitemapIndex],
	['sitemap', sitemap],
]) {
	assertExcludes(content, 'https://example.com', label);
}

assertIncludes(index, 'href="/blog/favicon.svg"', 'home page');
assertIncludes(index, 'href="/blog/sitemap-index.xml"', 'home page');
assertIncludes(index, 'href="https://jinruihub.github.io/blog/rss.xml"', 'home page');
assertIncludes(index, 'href="https://jinruihub.github.io/blog/"', 'home page canonical');
assertIncludes(index, 'href="/blog/"', 'home page nav');
assertIncludes(index, 'href="/blog/blog"', 'blog nav');
assertIncludes(index, 'href="/blog/docs"', 'docs nav');
assertIncludes(index, 'href="/blog/fonts/atkinson-regular.woff"', 'regular font preload');
assertIncludes(index, 'href="/blog/fonts/atkinson-bold.woff"', 'bold font preload');
assertIncludes(index, 'url("/blog/fonts/atkinson-regular.woff")', 'regular font face');
assertIncludes(index, 'url("/blog/fonts/atkinson-bold.woff")', 'bold font face');

assertExcludes(index, 'href="/favicon.svg"', 'home page');
assertExcludes(index, 'href="/sitemap-index.xml"', 'home page');
assertExcludes(index, 'href="/fonts/atkinson', 'home page');
assertExcludes(index, 'url("/fonts/atkinson', 'home page');

assertIncludes(blogIndex, 'href="/blog/blog/first/"', 'blog index');
assertIncludes(blogIndex, 'href="/blog/blog/chinese/sanzijing/"', 'blog index');
assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs index');
assertIncludes(docsIndex, 'href="/blog/docs/reference/example/"', 'docs index');

assertIncludes(rss, '<link>https://jinruihub.github.io/blog/</link>', 'rss feed');
assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/first/', 'rss feed');
assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/chinese/sanzijing/', 'rss feed');

assertIncludes(
	sitemapIndex,
	'<loc>https://jinruihub.github.io/blog/sitemap-0.xml</loc>',
	'sitemap index',
);
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/</loc>', 'sitemap');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/blog/first/</loc>', 'sitemap');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/docs/</loc>', 'sitemap');

console.log('Build output links are base-aware.');
