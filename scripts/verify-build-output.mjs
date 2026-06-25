import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const site = 'https://jinruihub.github.io';
const base = '/blog/';

async function readDist(path) {
	return readFile(new URL(path, dist), 'utf8');
}

function assertContains(source, expected, file) {
	assert.ok(source.includes(expected), `${file} should contain ${expected}`);
}

function assertNotContains(source, unexpected, file) {
	assert.ok(!source.includes(unexpected), `${file} should not contain ${unexpected}`);
}

function assertBaseAwareDocument(source, file) {
	for (const expected of [
		`href="${base}"`,
		`href="${base}blog"`,
		`href="${base}docs"`,
		`href="${base}favicon.svg"`,
		`href="${base}sitemap-index.xml"`,
		`href="${base}fonts/atkinson-regular.woff"`,
		`href="${base}fonts/atkinson-bold.woff"`,
		`url("${base}fonts/atkinson-regular.woff")`,
		`url("${base}fonts/atkinson-bold.woff")`,
	]) {
		assertContains(source, expected, file);
	}

	for (const unexpected of [
		'https://example.com',
		'href="/blog"',
		'href="/docs"',
		'href="/favicon.svg"',
		'href="/sitemap-index.xml"',
		'href="/fonts/atkinson-regular.woff"',
		'href="/fonts/atkinson-bold.woff"',
		'url("/fonts/atkinson-regular.woff")',
		'url("/fonts/atkinson-bold.woff")',
	]) {
		assertNotContains(source, unexpected, file);
	}
}

const documents = new Map([
	['index.html', await readDist('index.html')],
	[join('blog', 'index.html'), await readDist('blog/index.html')],
	[join('docs', 'index.html'), await readDist('docs/index.html')],
	[join('blog', 'first', 'index.html'), await readDist('blog/first/index.html')],
	[join('docs', 'guides', 'example', 'index.html'), await readDist('docs/guides/example/index.html')],
]);

for (const [file, source] of documents) {
	assertBaseAwareDocument(source, file);
	assertContains(source, `href="${site}${base}`, file);
	assertNotContains(source, `href="${site}/"`, file);
}

const blogIndex = documents.get(join('blog', 'index.html'));
assertContains(blogIndex, `href="${base}blog/first/"`, 'blog/index.html');
assertNotContains(blogIndex, 'href="/blog/first/"', 'blog/index.html');

const docsIndex = documents.get(join('docs', 'index.html'));
assertContains(docsIndex, `href="${base}docs/guides/example/"`, 'docs/index.html');
assertNotContains(docsIndex, 'href="/docs/guides/example/"', 'docs/index.html');

const rss = await readDist('rss.xml');
assertContains(rss, `<link>${site}${base}</link>`, 'rss.xml');
assertContains(rss, `<link>${site}${base}blog/first/</link>`, 'rss.xml');
assertNotContains(rss, 'https://example.com', 'rss.xml');
assertNotContains(rss, `<link>${site}/blog/first/</link>`, 'rss.xml');

const sitemapIndex = await readDist('sitemap-index.xml');
const sitemap = await readDist('sitemap-0.xml');
assertContains(sitemapIndex, `${site}${base}sitemap-0.xml`, 'sitemap-index.xml');
assertContains(sitemap, `${site}${base}blog/first/`, 'sitemap-0.xml');
assertContains(sitemap, `${site}${base}docs/guides/example/`, 'sitemap-0.xml');
assertNotContains(sitemapIndex, 'https://example.com', 'sitemap-index.xml');
assertNotContains(sitemap, 'https://example.com', 'sitemap-0.xml');

console.log('Build output uses the GitHub Pages /blog/ base path.');
