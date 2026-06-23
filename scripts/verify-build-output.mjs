import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');

const readDist = (path) => {
	const filePath = join(distDir, path);

	if (!existsSync(filePath)) {
		throw new Error(`Expected build output to include ${path}`);
	}

	return readFileSync(filePath, 'utf8');
};

const assertIncludes = (content, expected, label) => {
	if (!content.includes(expected)) {
		throw new Error(`Expected ${label} to include ${expected}`);
	}
};

const assertNotIncludes = (content, unexpected, label) => {
	if (content.includes(unexpected)) {
		throw new Error(`Expected ${label} not to include ${unexpected}`);
	}
};

const assertExists = (path) => {
	if (!existsSync(join(distDir, path))) {
		throw new Error(`Expected build output to include ${path}`);
	}
};

const home = readDist('index.html');
const blogIndex = readDist('blog/index.html');
const docsIndex = readDist('docs/index.html');
const rss = readDist('rss.xml');
const sitemapIndex = readDist('sitemap-index.xml');
const sitemap = readDist('sitemap-0.xml');

assertExists('favicon.svg');
assertExists('fonts/atkinson-regular.woff');
assertExists('fonts/atkinson-bold.woff');

assertIncludes(home, 'href="/blog/"', 'home page');
assertIncludes(home, 'href="/blog/blog"', 'home page navigation');
assertIncludes(home, 'href="/blog/docs"', 'home page navigation');
assertIncludes(home, 'href="/blog/favicon.svg"', 'home page head');
assertIncludes(home, 'href="/blog/sitemap-index.xml"', 'home page head');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/rss.xml"', 'home page RSS link');
assertIncludes(home, 'href="/blog/fonts/atkinson-regular.woff"', 'home page font preload');
assertIncludes(home, 'url("/blog/fonts/atkinson-regular.woff")', 'home page font face');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/"', 'home page canonical URL');
assertNotIncludes(home, 'https://example.com', 'home page');
assertNotIncludes(home, 'href="/favicon.svg"', 'home page head');
assertNotIncludes(home, 'href="/fonts/', 'home page head');
assertNotIncludes(home, 'url("/fonts/', 'home page CSS');

assertIncludes(blogIndex, 'href="/blog/blog/first/"', 'blog index links');
assertIncludes(blogIndex, 'href="/blog/blog/chinese/sanzijing/"', 'blog index links');
assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs index links');
assertIncludes(docsIndex, 'href="/blog/docs/reference/example/"', 'docs index links');

assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/first/', 'RSS item links');
assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/chinese/sanzijing/', 'RSS item links');
assertNotIncludes(rss, 'https://example.com', 'RSS feed');

assertIncludes(sitemapIndex, 'https://jinruihub.github.io/blog/sitemap-0.xml', 'sitemap index');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/', 'sitemap');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/blog/first/', 'sitemap');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/docs/guides/example/', 'sitemap');
assertNotIncludes(sitemap, 'https://example.com', 'sitemap');

console.log('Build output URLs are base-aware.');
