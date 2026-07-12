import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);

function readDistFile(path) {
	return readFileSync(new URL(path, distDir), 'utf8');
}

function listFiles(dir, prefix = '') {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
		const fullPath = join(dir, entry.name);

		if (entry.isDirectory()) {
			return listFiles(fullPath, relativePath);
		}

		return relativePath;
	});
}

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function assertIncludes(content, expected, file) {
	assert(content.includes(expected), `${file} should include ${expected}`);
}

function assertNotIncludes(content, unexpected, file) {
	assert(!content.includes(unexpected), `${file} should not include ${unexpected}`);
}

assert(existsSync(distDir), 'dist directory is missing; run pnpm build first');

const textFiles = listFiles(distDir.pathname)
	.filter((file) => /\.(?:html|xml|css)$/.test(file))
	.map((file) => [file, readDistFile(file)]);

for (const [file, content] of textFiles) {
	assertNotIncludes(content, 'https://example.com', file);
	assertNotIncludes(content, 'href="/favicon.svg"', file);
	assertNotIncludes(content, 'href="/fonts/', file);
	assertNotIncludes(content, 'url("/fonts/', file);
	assertNotIncludes(content, "url('/fonts/", file);
	assertNotIncludes(content, 'url(/fonts/', file);
	assertNotIncludes(content, '/blog/blog/_astro/', file);
}

const home = readDistFile('index.html');
assertIncludes(home, 'href="/blog/"', 'index.html');
assertIncludes(home, 'href="/blog/blog/"', 'index.html');
assertIncludes(home, 'href="/blog/docs/"', 'index.html');
assertIncludes(home, 'href="/blog/favicon.svg"', 'index.html');
assertIncludes(home, 'href="/blog/fonts/atkinson-regular.woff"', 'index.html');
assertIncludes(home, 'url("/blog/fonts/atkinson-regular.woff")', 'index.html');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/"', 'index.html');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/rss.xml"', 'index.html');

const blogIndex = readDistFile('blog/index.html');
assertIncludes(blogIndex, 'href="/blog/blog/first/"', 'blog/index.html');
assertIncludes(blogIndex, 'href="https://jinruihub.github.io/blog/blog/"', 'blog/index.html');

const docsIndex = readDistFile('docs/index.html');
assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs/index.html');
assertIncludes(docsIndex, 'href="https://jinruihub.github.io/blog/docs/"', 'docs/index.html');

const rss = readDistFile('rss.xml');
assertIncludes(rss, '<link>https://jinruihub.github.io/blog/</link>', 'rss.xml');
assertIncludes(rss, '<link>https://jinruihub.github.io/blog/blog/first/</link>', 'rss.xml');
assertNotIncludes(rss, '<link>https://jinruihub.github.io/blog/first/</link>', 'rss.xml');

const sitemapIndex = readDistFile('sitemap-index.xml');
assertIncludes(
	sitemapIndex,
	'<loc>https://jinruihub.github.io/blog/sitemap-0.xml</loc>',
	'sitemap-index.xml',
);

const sitemap = readDistFile('sitemap-0.xml');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/</loc>', 'sitemap-0.xml');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/blog/first/</loc>', 'sitemap-0.xml');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/docs/guides/example/</loc>', 'sitemap-0.xml');

console.log('Build output uses the GitHub Pages /blog/ base correctly.');
