import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);

function filePath(relativePath) {
	return new URL(relativePath, distDir);
}

function read(relativePath) {
	return readFileSync(filePath(relativePath), 'utf8');
}

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function assertFile(relativePath) {
	assert(existsSync(filePath(relativePath)), `Expected ${relativePath} to exist`);
}

function walk(dir) {
	return readdirSync(dir).flatMap((entry) => {
		const fullPath = join(dir, entry);
		return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
	});
}

assertFile('index.html');
assertFile('blog/index.html');
assertFile('docs/index.html');
assertFile('rss.xml');
assertFile('sitemap-index.xml');
assertFile('sitemap-0.xml');

const index = read('index.html');
assert(index.includes('href="/blog/favicon.svg"'), 'favicon should include the /blog/ base path');
assert(index.includes('href="/blog/fonts/atkinson-regular.woff"'), 'regular font preload should include the /blog/ base path');
assert(index.includes('href="/blog/fonts/atkinson-bold.woff"'), 'bold font preload should include the /blog/ base path');
assert(index.includes('href="https://jinruihub.github.io/blog/rss.xml"'), 'RSS alternate link should include the GitHub Pages base path');
assert(index.includes('href="https://jinruihub.github.io/blog/"'), 'homepage canonical URL should include the GitHub Pages base path');
assert(index.includes('href="/blog/blog"'), 'blog nav link should include both deployment base and app route');
assert(index.includes('href="/blog/docs"'), 'docs nav link should include the deployment base');

const blogIndex = read('blog/index.html');
assert(blogIndex.includes('href="/blog/blog/first/"'), 'blog listing should link to posts under /blog/blog/');
assert(!blogIndex.includes('href="/blog/first/"'), 'blog listing should not drop the /blog app route segment');

const docsIndex = read('docs/index.html');
assert(docsIndex.includes('href="/blog/docs/guides/example/"'), 'docs listing should include the deployment base');

const rss = read('rss.xml');
assert(rss.includes('https://jinruihub.github.io/blog/blog/first/'), 'RSS item links should include deployment base and app route');
assert(!rss.includes('https://jinruihub.github.io/blog/first/'), 'RSS item links should not drop the /blog app route segment');

const sitemapIndex = read('sitemap-index.xml');
const sitemap = read('sitemap-0.xml');
assert(sitemapIndex.includes('https://jinruihub.github.io/blog/sitemap-0.xml'), 'sitemap index should include deployment base');
assert(sitemap.includes('https://jinruihub.github.io/blog/blog/first/'), 'sitemap should include deployment base for posts');
assert(sitemap.includes('https://jinruihub.github.io/blog/docs/guides/example/'), 'sitemap should include deployment base for docs');

const textFiles = walk(distDir.pathname).filter((path) => /\.(?:html|xml|css|js)$/.test(path));
for (const path of textFiles) {
	const contents = readFileSync(path, 'utf8');
	assert(!contents.includes('https://example.com'), `${path} should not contain the placeholder origin`);
	assert(!contents.includes('/blog/blog/_astro/'), `${path} should not double-prefix Astro assets`);

	for (const forbidden of [
		'href="/favicon.svg"',
		'href="/sitemap-index.xml"',
		'href="/rss.xml"',
		'href="/fonts/',
		'src="/fonts/',
	]) {
		assert(!contents.includes(forbidden), `${path} contains root-relative ${forbidden}`);
	}

	const rootRelativeLocalUrl = contents.match(/\b(?:href|src)=["']\/(?!blog(?:[/"'?#]|$))/);
	assert(!rootRelativeLocalUrl, `${path} contains root-relative local URL ${rootRelativeLocalUrl?.[0]}`);
}

console.log('Build output uses the GitHub Pages /blog/ base path.');
