import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

async function readDistFile(path) {
	return readFile(new URL(path, distDir), 'utf8');
}

function assertIncludes(contents, expected, file) {
	assert(contents.includes(expected), `${file} is missing ${expected}`);
}

function assertExcludes(contents, forbidden, file) {
	assert(!contents.includes(forbidden), `${file} must not contain ${forbidden}`);
}

function assertNoBrokenRootUrls(contents, file) {
	const brokenPatterns = [
		/href="\/"/,
		/href="\/docs(?:\/|")/,
		/href="\/favicon\.svg"/,
		/href="\/sitemap-index\.xml"/,
		/href="\/fonts\//,
		/url\("\/fonts\//,
		/https:\/\/example\.com/,
	];

	for (const pattern of brokenPatterns) {
		assert(!pattern.test(contents), `${file} contains root-relative or placeholder URL: ${pattern}`);
	}
}

async function verifyHtml() {
	const root = await readDistFile('index.html');
	assertIncludes(root, 'href="/blog/"', 'index.html');
	assertIncludes(root, 'href="/blog/blog"', 'index.html');
	assertIncludes(root, 'href="/blog/docs"', 'index.html');
	assertIncludes(root, 'href="/blog/favicon.svg"', 'index.html');
	assertIncludes(root, 'href="/blog/sitemap-index.xml"', 'index.html');
	assertIncludes(root, 'href="https://jinruihub.github.io/blog/rss.xml"', 'index.html');
	assertIncludes(root, 'href="https://jinruihub.github.io/blog/"', 'index.html');
	assertIncludes(root, 'href="/blog/fonts/atkinson-regular.woff"', 'index.html');
	assertIncludes(root, 'url("/blog/fonts/atkinson-regular.woff")', 'index.html');
	assertNoBrokenRootUrls(root, 'index.html');

	const blogIndex = await readDistFile('blog/index.html');
	assertIncludes(blogIndex, 'href="/blog/blog/top/"', 'blog/index.html');
	assertIncludes(blogIndex, 'href="/blog/blog/chinese/sanzijing/"', 'blog/index.html');
	assertIncludes(blogIndex, 'href="https://jinruihub.github.io/blog/blog/"', 'blog/index.html');
	assertNoBrokenRootUrls(blogIndex, 'blog/index.html');

	const docsIndex = await readDistFile('docs/index.html');
	assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs/index.html');
	assertIncludes(docsIndex, 'href="/blog/docs/reference/example/"', 'docs/index.html');
	assertIncludes(docsIndex, 'href="https://jinruihub.github.io/blog/docs/"', 'docs/index.html');
	assertNoBrokenRootUrls(docsIndex, 'docs/index.html');
}

async function verifyRss() {
	const rss = await readDistFile('rss.xml');
	assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/top/', 'rss.xml');
	assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/chinese/sanzijing/', 'rss.xml');
	assertExcludes(rss, 'https://example.com', 'rss.xml');
	assertExcludes(rss, 'https://jinruihub.github.io/blog/top/', 'rss.xml');
}

async function verifySitemap() {
	const sitemapIndexPath = join(distDir.pathname, 'sitemap-index.xml');
	if (!existsSync(sitemapIndexPath)) {
		return;
	}

	const sitemapIndex = await readDistFile('sitemap-index.xml');
	assertIncludes(sitemapIndex, 'https://jinruihub.github.io/blog/sitemap-0.xml', 'sitemap-index.xml');
	assertExcludes(sitemapIndex, 'https://example.com', 'sitemap-index.xml');

	const sitemap = await readDistFile('sitemap-0.xml');
	assertIncludes(sitemap, 'https://jinruihub.github.io/blog/', 'sitemap-0.xml');
	assertIncludes(sitemap, 'https://jinruihub.github.io/blog/blog/top/', 'sitemap-0.xml');
	assertIncludes(sitemap, 'https://jinruihub.github.io/blog/docs/guides/example/', 'sitemap-0.xml');
	assertExcludes(sitemap, 'https://example.com', 'sitemap-0.xml');
}

await verifyHtml();
await verifyRss();
await verifySitemap();

console.log('Build output URLs are correctly scoped to /blog/.');
