import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

function readDist(relativePath) {
	const filePath = path.join(distDir, relativePath);

	if (!existsSync(filePath)) {
		throw new Error(`Expected build output ${relativePath} to exist`);
	}

	return readFileSync(filePath, 'utf8');
}

function assertIncludes(content, expected, label) {
	if (!content.includes(expected)) {
		throw new Error(`${label}: expected to include ${expected}`);
	}
}

function assertNotIncludes(content, unexpected, label) {
	if (content.includes(unexpected)) {
		throw new Error(`${label}: did not expect to include ${unexpected}`);
	}
}

function collectFiles(directory, extension) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const entryPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			return collectFiles(entryPath, extension);
		}

		return entry.name.endsWith(extension) ? [entryPath] : [];
	});
}

const home = readDist('index.html');
const blogIndex = readDist('blog/index.html');
const docsIndex = readDist('docs/index.html');
const rss = readDist('rss.xml');
const sitemapIndex = readDist('sitemap-index.xml');
const sitemap = readDist('sitemap-0.xml');

for (const [label, content] of [
	['home', home],
	['blog index', blogIndex],
	['docs index', docsIndex],
	['rss', rss],
	['sitemap index', sitemapIndex],
	['sitemap', sitemap],
]) {
	assertNotIncludes(content, 'https://example.com', label);
}

assertIncludes(home, 'href="/blog/"', 'home navigation');
assertIncludes(home, 'href="/blog/blog/"', 'blog navigation');
assertIncludes(home, 'href="/blog/docs/"', 'docs navigation');
assertIncludes(home, 'href="/blog/favicon.svg"', 'favicon URL');
assertIncludes(home, 'href="/blog/sitemap-index.xml"', 'sitemap URL');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/rss.xml"', 'RSS URL');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/"', 'canonical URL');
assertIncludes(home, 'href="/blog/fonts/atkinson-regular.woff"', 'regular font preload');
assertIncludes(home, 'href="/blog/fonts/atkinson-bold.woff"', 'bold font preload');
assertNotIncludes(home, 'href="/"', 'home root-relative navigation');
assertNotIncludes(home, 'href="/favicon.svg"', 'root-relative favicon');
assertNotIncludes(home, 'href="/sitemap-index.xml"', 'root-relative sitemap');

assertIncludes(blogIndex, 'href="/blog/blog/first/"', 'blog post link');
assertIncludes(blogIndex, 'href="/blog/blog/chinese/sanzijing/"', 'nested blog post link');
assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs guide link');
assertIncludes(docsIndex, 'href="/blog/docs/reference/example/"', 'docs reference link');

assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/first/', 'RSS post link');
assertNotIncludes(rss, 'https://jinruihub.github.io/blog/first/', 'RSS missing blog route');

assertIncludes(sitemapIndex, 'https://jinruihub.github.io/blog/sitemap-0.xml', 'sitemap index');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/blog/first/', 'sitemap blog entry');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/docs/guides/example/', 'sitemap docs entry');

for (const cssPath of collectFiles(distDir, '.css')) {
	const css = readFileSync(cssPath, 'utf8');
	assertNotIncludes(css, 'url("/fonts/', path.relative(distDir, cssPath));
}

console.log('Build output URLs are GitHub Pages base-path safe.');
