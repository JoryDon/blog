import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);
const site = 'https://jinruihub.github.io';
const base = '/blog';

function fail(message) {
	throw new Error(message);
}

function assert(condition, message) {
	if (!condition) {
		fail(message);
	}
}

function distPath(path) {
	return join(distDir.pathname, path);
}

function readDist(path) {
	const fullPath = distPath(path);
	assert(existsSync(fullPath), `Expected ${path} to exist in dist`);
	return readFileSync(fullPath, 'utf8');
}

function walkFiles(dir) {
	return readdirSync(dir).flatMap((entry) => {
		const fullPath = join(dir, entry);
		return statSync(fullPath).isDirectory() ? walkFiles(fullPath) : [fullPath];
	});
}

for (const asset of ['favicon.svg', 'fonts/atkinson-regular.woff', 'fonts/atkinson-bold.woff']) {
	assert(existsSync(distPath(asset)), `Expected public asset ${asset} to be copied to dist`);
}

const home = readDist('index.html');
const blogIndex = readDist('blog/index.html');
const docsIndex = readDist('docs/index.html');
const rss = readDist('rss.xml');
const sitemapIndex = readDist('sitemap-index.xml');
const sitemap = readDist('sitemap-0.xml');

assert(home.includes('href="/blog/favicon.svg"'), 'Home page should reference the favicon under /blog');
assert(home.includes('href="/blog/sitemap-index.xml"'), 'Home page should reference the sitemap under /blog');
assert(
	home.includes(`href="${site}${base}/rss.xml"`),
	'Home page should advertise the RSS feed under the production base path',
);
assert(
	home.includes(`href="${site}${base}`),
	'Home page canonical URL should use the production GitHub Pages URL',
);
assert(home.includes('href="/blog"'), 'Header home link should point at the deployed base path');
assert(home.includes('href="/blog/blog"'), 'Header blog link should include the deployed base path');
assert(home.includes('href="/blog/docs"'), 'Header docs link should include the deployed base path');
assert(home.includes('href="/blog/fonts/atkinson-regular.woff"'), 'Regular font preload should include base path');
assert(home.includes('url("/blog/fonts/atkinson-bold.woff")'), 'Inline font CSS should include base path');

assert(blogIndex.includes('href="/blog/blog/first/"'), 'Blog list should link posts under /blog/blog');
assert(docsIndex.includes('href="/blog/docs/guides/example/"'), 'Docs list should link docs under /blog/docs');
assert(rss.includes(`<link>${site}${base}/blog/first/</link>`), 'RSS item links should include base path');
assert(
	sitemapIndex.includes(`<loc>${site}${base}/sitemap-0.xml</loc>`),
	'Sitemap index should include base path',
);
assert(sitemap.includes(`<loc>${site}${base}/blog/first/</loc>`), 'Sitemap URLs should include base path');

const textFiles = walkFiles(distDir.pathname).filter((path) => /\.(?:html|css|xml|js)$/.test(path));
const renderedOutput = textFiles.map((path) => readFileSync(path, 'utf8')).join('\n');

for (const forbidden of [
	'href="/favicon.svg"',
	'href="/sitemap-index.xml"',
	'href="/fonts/',
	'src: url("/fonts/',
	`${site}/rss.xml`,
	`${site}/blog/first/`,
	'https://example.com',
]) {
	assert(!renderedOutput.includes(forbidden), `Rendered output should not include ${forbidden}`);
}

console.log('Build output is correctly scoped to /blog/.');
