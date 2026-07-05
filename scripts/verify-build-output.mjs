import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);
const root = distDir.pathname;

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function readDistFile(relativePath) {
	const fullPath = join(root, relativePath);

	assert(existsSync(fullPath), `Expected ${relativePath} to exist in dist`);
	return readFileSync(fullPath, 'utf8');
}

function listTextFiles(dir = root, prefix = '') {
	return readdirSync(dir).flatMap((entry) => {
		const fullPath = join(dir, entry);
		const relativePath = join(prefix, entry);

		if (statSync(fullPath).isDirectory()) {
			return listTextFiles(fullPath, relativePath);
		}

		return /\.(html|xml|css|js)$/.test(entry) ? [relativePath] : [];
	});
}

function assertIncludes(content, expected, file) {
	assert(
		content.includes(expected),
		`Expected ${file} to contain ${JSON.stringify(expected)}`,
	);
}

function assertNotIncludes(content, unexpected, file) {
	assert(
		!content.includes(unexpected),
		`Expected ${file} not to contain ${JSON.stringify(unexpected)}`,
	);
}

const index = readDistFile('index.html');
const blogIndex = readDistFile('blog/index.html');
const docsIndex = readDistFile('docs/index.html');
const rss = readDistFile('rss.xml');
const sitemapIndex = readDistFile('sitemap-index.xml');
const sitemap = readDistFile('sitemap-0.xml');

assertIncludes(index, 'href="/blog/"', 'index.html');
assertIncludes(index, 'href="/blog/blog"', 'index.html');
assertIncludes(index, 'href="/blog/docs"', 'index.html');
assertIncludes(index, 'href="/blog/favicon.svg"', 'index.html');
assertIncludes(index, 'href="/blog/fonts/atkinson-regular.woff"', 'index.html');
assertIncludes(index, 'url("/blog/fonts/atkinson-regular.woff")', 'index.html');
assertIncludes(index, 'href="https://jinruihub.github.io/blog/rss.xml"', 'index.html');
assertIncludes(index, 'href="https://jinruihub.github.io/blog/"', 'index.html');
assertIncludes(blogIndex, 'href="/blog/blog/first/"', 'blog/index.html');
assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs/index.html');
assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/first/', 'rss.xml');
assertIncludes(sitemapIndex, 'https://jinruihub.github.io/blog/sitemap-0.xml', 'sitemap-index.xml');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/blog/first/', 'sitemap-0.xml');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/docs/guides/example/', 'sitemap-0.xml');

for (const file of listTextFiles()) {
	const content = readDistFile(file);

	assertNotIncludes(content, 'https://example.com', file);
	assertNotIncludes(content, '/blog/blog/_astro/', file);
	assertNotIncludes(content, 'href="/favicon.svg"', file);
	assertNotIncludes(content, 'href="/fonts/', file);
	assertNotIncludes(content, 'url("/fonts/', file);
	assertNotIncludes(content, "url('/fonts/", file);
	assertNotIncludes(content, 'href="/rss.xml"', file);
	assertNotIncludes(content, 'href="/sitemap-index.xml"', file);
	assertNotIncludes(content, 'href="/docs', file);
	assertNotIncludes(content, 'href="/blog/first/', file);
	assertNotIncludes(content, 'href="/blog/second/', file);
	assertNotIncludes(content, 'href="/blog/top/', file);
	assertNotIncludes(content, 'href="/blog/chinese/sanzijing/', file);
}

console.log('Build output URL checks passed.');
