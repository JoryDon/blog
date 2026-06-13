import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = fileURLToPath(new URL('../dist/', import.meta.url));
const siteOrigin = 'https://jinruihub.github.io';
const siteBase = '/blog/';

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function readDistFile(relativePath) {
	const filePath = join(distDir, relativePath);
	assert(existsSync(filePath), `Expected build output ${relativePath} to exist`);
	return readFileSync(filePath, 'utf8');
}

function assertIncludes(content, expected, label) {
	assert(content.includes(expected), `${label} should include ${expected}`);
}

function assertNotIncludes(content, unexpected, label) {
	assert(!content.includes(unexpected), `${label} should not include ${unexpected}`);
}

function walkFiles(dir) {
	return readdirSync(dir).flatMap((entry) => {
		const filePath = join(dir, entry);
		return statSync(filePath).isDirectory() ? walkFiles(filePath) : [filePath];
	});
}

const home = readDistFile('index.html');
const blogIndex = readDistFile('blog/index.html');
const firstPost = readDistFile('blog/first/index.html');
const docsIndex = readDistFile('docs/index.html');
const rss = readDistFile('rss.xml');
const sitemapIndex = readDistFile('sitemap-index.xml');
const sitemap = readDistFile('sitemap-0.xml');

assert(existsSync(join(distDir, 'favicon.svg')), 'Expected favicon in build output');
assert(existsSync(join(distDir, 'fonts/atkinson-regular.woff')), 'Expected regular font in build output');
assert(existsSync(join(distDir, 'fonts/atkinson-bold.woff')), 'Expected bold font in build output');

assertIncludes(home, 'href="/blog/"', 'home page');
assertIncludes(home, 'href="/blog/blog"', 'home page');
assertIncludes(home, 'href="/blog/docs"', 'home page');
assertIncludes(home, 'href="/blog/favicon.svg"', 'home page');
assertIncludes(home, `${siteOrigin}${siteBase}rss.xml`, 'home page RSS alternate');
assertIncludes(home, 'href="/blog/fonts/atkinson-regular.woff"', 'home page font preload');
assertIncludes(home, 'url("/blog/fonts/atkinson-regular.woff")', 'home page font face');

assertIncludes(blogIndex, 'href="/blog/blog/first/"', 'blog index');
assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs index');
assertIncludes(firstPost, `${siteOrigin}/blog/blog/first/`, 'first post canonical');
assertIncludes(rss, `${siteOrigin}/blog/blog/first/`, 'RSS item link');
assertIncludes(sitemapIndex, `${siteOrigin}/blog/sitemap-0.xml`, 'sitemap index');
assertIncludes(sitemap, `${siteOrigin}/blog/blog/first/`, 'sitemap entry');

for (const filePath of walkFiles(distDir)) {
	if (!['.css', '.html', '.xml'].includes(extname(filePath))) {
		continue;
	}

	const rel = relative(distDir, filePath);
	const content = readFileSync(filePath, 'utf8');
	assertNotIncludes(content, 'https://example.com', rel);
	assert(!/\b(?:href|src)=["']\/(?!blog(?:\/|["']))/.test(content), `${rel} has root-relative href/src outside ${siteBase}`);
	assert(!/url\(["']?\/(?!blog\/)/.test(content), `${rel} has root-relative CSS URL outside ${siteBase}`);
}

console.log('Build output is base-aware for GitHub Pages /blog/.');
