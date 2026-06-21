import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url).pathname;

function readDistFile(path) {
	const filePath = join(distDir, path);

	if (!existsSync(filePath)) {
		throw new Error(`Expected ${path} to exist in dist`);
	}

	return readFileSync(filePath, 'utf8');
}

function assertIncludes(content, expected, file) {
	if (!content.includes(expected)) {
		throw new Error(`Expected ${file} to include ${expected}`);
	}
}

function assertExcludes(content, unexpected, file) {
	if (content.includes(unexpected)) {
		throw new Error(`Expected ${file} not to include ${unexpected}`);
	}
}

function listTextFiles(directory, prefix = '') {
	return readdirSync(directory).flatMap((entry) => {
		const relativePath = join(prefix, entry);
		const absolutePath = join(directory, entry);

		if (statSync(absolutePath).isDirectory()) {
			return listTextFiles(absolutePath, relativePath);
		}

		return /\.(html|xml|css|js)$/.test(entry) ? [relativePath] : [];
	});
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
assertIncludes(blogIndex, 'href="/blog/blog/chinese/sanzijing/"', 'blog/index.html');
assertIncludes(docsIndex, 'href="/blog/docs/reference/example/"', 'docs/index.html');
assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs/index.html');

assertIncludes(rss, '<link>https://jinruihub.github.io/blog/</link>', 'rss.xml');
assertIncludes(rss, '<link>https://jinruihub.github.io/blog/blog/first/</link>', 'rss.xml');
assertIncludes(sitemapIndex, '<loc>https://jinruihub.github.io/blog/sitemap-0.xml</loc>', 'sitemap-index.xml');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/blog/first/</loc>', 'sitemap-0.xml');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/docs/reference/example/</loc>', 'sitemap-0.xml');

for (const file of listTextFiles(distDir)) {
	const content = readDistFile(file);
	assertExcludes(content, 'https://example.com', file);
	assertExcludes(content, 'href="/favicon.svg"', file);
	assertExcludes(content, 'href="/sitemap-index.xml"', file);
	assertExcludes(content, 'href="/fonts/', file);
	assertExcludes(content, 'url(/fonts/', file);
}

console.log('Build output URLs are base-aware.');
