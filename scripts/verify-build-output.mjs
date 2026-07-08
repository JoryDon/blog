import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

async function readDist(path) {
	return readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
}

function assertIncludes(content, expected, file) {
	assert.ok(content.includes(expected), `${file} should include ${expected}`);
}

function assertNotIncludes(content, unexpected, file) {
	assert.ok(!content.includes(unexpected), `${file} should not include ${unexpected}`);
}

const index = await readDist('index.html');
const blogIndex = await readDist('blog/index.html');
const docsIndex = await readDist('docs/index.html');
const rss = await readDist('rss.xml');
const sitemapIndex = await readDist('sitemap-index.xml');
const sitemap = await readDist('sitemap-0.xml');

for (const [file, content] of [
	['index.html', index],
	['blog/index.html', blogIndex],
	['docs/index.html', docsIndex],
	['rss.xml', rss],
	['sitemap-index.xml', sitemapIndex],
	['sitemap-0.xml', sitemap],
]) {
	assertNotIncludes(content, 'https://example.com', file);
}

assertIncludes(index, 'href="/blog/"', 'index.html');
assertIncludes(index, 'href="/blog/blog"', 'index.html');
assertIncludes(index, 'href="/blog/docs"', 'index.html');
assertIncludes(index, 'href="/blog/favicon.svg"', 'index.html');
assertIncludes(index, 'href="/blog/fonts/atkinson-regular.woff"', 'index.html');
assertIncludes(index, 'url("/blog/fonts/atkinson-regular.woff")', 'index.html');
assertIncludes(index, 'href="https://jinruihub.github.io/blog/rss.xml"', 'index.html');
assertIncludes(index, 'href="https://jinruihub.github.io/blog/"', 'index.html');

assertIncludes(blogIndex, 'href="/blog/blog/first/"', 'blog/index.html');
assertIncludes(blogIndex, 'href="/blog/blog/chinese/sanzijing/"', 'blog/index.html');
assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs/index.html');

assertIncludes(rss, '<link>https://jinruihub.github.io/blog/</link>', 'rss.xml');
assertIncludes(rss, '<link>https://jinruihub.github.io/blog/blog/first/</link>', 'rss.xml');
assertIncludes(sitemapIndex, 'https://jinruihub.github.io/blog/sitemap-0.xml', 'sitemap-index.xml');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/blog/first/', 'sitemap-0.xml');

console.log('Build output uses the GitHub Pages /blog/ base path.');
