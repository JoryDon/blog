import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const origin = 'https://jinruihub.github.io';
const base = '/blog';

function readOutput(path) {
	return readFileSync(new URL(path, dist), 'utf8');
}

function assertIncludes(content, expected, file) {
	if (!content.includes(expected)) {
		throw new Error(`${file} should include ${expected}`);
	}
}

function assertNotIncludes(content, unexpected, file) {
	if (content.includes(unexpected)) {
		throw new Error(`${file} should not include ${unexpected}`);
	}
}

function assertEveryOutput(content, file) {
	assertNotIncludes(content, 'https://example.com', file);
	assertNotIncludes(content, 'href="/favicon.svg"', file);
	assertNotIncludes(content, 'href="/fonts/', file);
	assertNotIncludes(content, 'url("/fonts/', file);
	assertNotIncludes(content, `${base}${base}/_astro/`, file);
}

const pages = [
	['index.html', readOutput('index.html')],
	['blog/index.html', readOutput('blog/index.html')],
	['docs/index.html', readOutput('docs/index.html')],
];

for (const [file, content] of pages) {
	assertEveryOutput(content, file);
	assertIncludes(content, `href="${base}/favicon.svg"`, file);
	assertIncludes(content, `href="${base}/fonts/atkinson-regular.woff"`, file);
	assertIncludes(content, `url("${base}/fonts/atkinson-regular.woff")`, file);
	assertIncludes(content, `href="${origin}${base}/rss.xml"`, file);
	assertIncludes(content, `href="${origin}${base}/sitemap-index.xml"`, file);
	assertIncludes(content, `content="${origin}${base}/_astro/`, file);
}

const home = pages[0][1];
assertIncludes(home, `href="${origin}${base}/"`, 'index.html');
assertIncludes(home, `content="${origin}${base}/"`, 'index.html');
assertIncludes(home, `href="${base}/"`, 'index.html');
assertIncludes(home, `href="${base}/blog"`, 'index.html');
assertIncludes(home, `href="${base}/docs"`, 'index.html');

const blogIndex = pages[1][1];
assertIncludes(blogIndex, `href="${origin}${base}/blog/"`, 'blog/index.html');
assertIncludes(blogIndex, `href="${base}/blog/`, 'blog/index.html');

const docsIndex = pages[2][1];
assertIncludes(docsIndex, `href="${origin}${base}/docs/"`, 'docs/index.html');
assertIncludes(docsIndex, `href="${base}/docs/`, 'docs/index.html');

const rss = readOutput('rss.xml');
assertEveryOutput(rss, 'rss.xml');
assertIncludes(rss, `<link>${origin}${base}/</link>`, 'rss.xml');
assertIncludes(rss, `${origin}${base}/blog/`, 'rss.xml');

const sitemapIndex = readOutput('sitemap-index.xml');
assertEveryOutput(sitemapIndex, 'sitemap-index.xml');
assertIncludes(sitemapIndex, `<loc>${origin}${base}/sitemap-0.xml</loc>`, 'sitemap-index.xml');

const sitemap = readOutput('sitemap-0.xml');
assertEveryOutput(sitemap, 'sitemap-0.xml');
assertIncludes(sitemap, `<loc>${origin}${base}/</loc>`, 'sitemap-0.xml');
assertIncludes(sitemap, `<loc>${origin}${base}/blog/`, 'sitemap-0.xml');
assertIncludes(sitemap, `<loc>${origin}${base}/docs/`, 'sitemap-0.xml');

console.log(`Verified GitHub Pages base URLs in ${join('dist', '**/*.{html,xml}')}`);
