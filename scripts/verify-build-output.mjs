import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);

function readDistFile(path) {
	const fileUrl = new URL(path, distDir);

	if (!existsSync(fileUrl)) {
		throw new Error(`Expected build output missing: dist/${path}`);
	}

	return readFileSync(fileUrl, 'utf8');
}

function walk(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);

		if (entry.isDirectory()) {
			return walk(path);
		}

		return path;
	});
}

function assertIncludes(content, expected, label) {
	if (!content.includes(expected)) {
		throw new Error(`${label} did not include ${expected}`);
	}
}

function assertNotIncludes(content, unexpected, label) {
	if (content.includes(unexpected)) {
		throw new Error(`${label} unexpectedly included ${unexpected}`);
	}
}

const distPath = distDir.pathname;
const textFiles = walk(distPath).filter((path) => /\.(?:html|xml|css)$/.test(path));

for (const path of textFiles) {
	const content = readFileSync(path, 'utf8');
	const label = relative(distPath, path);

	assertNotIncludes(content, 'https://example.com', label);
	assertNotIncludes(content, 'href="/favicon.svg"', label);
	assertNotIncludes(content, 'href="/sitemap-index.xml"', label);
	assertNotIncludes(content, 'href="/fonts/', label);
	assertNotIncludes(content, 'href="/_astro/', label);
	assertNotIncludes(content, 'src="/_astro/', label);
	assertNotIncludes(content, 'url(/fonts/', label);
	assertNotIncludes(content, 'url("/fonts/', label);
	assertNotIncludes(content, 'href="/blog"', label);
	assertNotIncludes(content, 'href="/docs"', label);
}

const home = readDistFile('index.html');
assertIncludes(home, 'href="/blog/"', 'home page');
assertIncludes(home, 'href="/blog/blog/"', 'home page');
assertIncludes(home, 'href="/blog/docs/"', 'home page');
assertIncludes(home, 'href="/blog/favicon.svg"', 'home page');
assertIncludes(home, 'href="/blog/fonts/atkinson-regular.woff"', 'home page');
assertIncludes(home, 'url("/blog/fonts/atkinson-regular.woff")', 'home page');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/rss.xml"', 'home page');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/"', 'home page canonical');

const blogIndex = readDistFile('blog/index.html');
assertIncludes(blogIndex, 'href="/blog/blog/second/"', 'blog index');
assertIncludes(blogIndex, 'href="/blog/blog/chinese/sanzijing/"', 'blog index');

const docsIndex = readDistFile('docs/index.html');
assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs index');
assertIncludes(docsIndex, 'href="/blog/docs/reference/example/"', 'docs index');

const rss = readDistFile('rss.xml');
assertIncludes(rss, '<link>https://jinruihub.github.io/blog/</link>', 'RSS channel');
assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/second/', 'RSS item');

const sitemap = readDistFile('sitemap-0.xml');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/</loc>', 'sitemap');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/blog/second/</loc>', 'sitemap');

console.log(`Verified ${textFiles.length} build output files are GitHub Pages base-aware.`);
