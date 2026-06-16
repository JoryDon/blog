import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);

function readDist(relativePath) {
	return readFileSync(new URL(relativePath, distDir), 'utf8');
}

function walkFiles(directory) {
	return readdirSync(directory).flatMap((entry) => {
		const path = join(directory, entry);
		return statSync(path).isDirectory() ? walkFiles(path) : [path];
	});
}

function assertIncludes(content, expected, file) {
	if (!content.includes(expected)) {
		throw new Error(`${file} should include ${expected}`);
	}
}

function assertNotIncludes(content, unexpected, file) {
	if (content.includes(unexpected)) {
		throw new Error(`${file} should not include ${unexpected}`);
	}
}

const indexHtml = readDist('index.html');
const blogIndexHtml = readDist('blog/index.html');
const rssXml = readDist('rss.xml');
const sitemapIndexXml = readDist('sitemap-index.xml');
const sitemapXml = readDist('sitemap-0.xml');

assertIncludes(indexHtml, 'href="/blog/favicon.svg"', 'index.html');
assertIncludes(indexHtml, 'href="https://jinruihub.github.io/blog/rss.xml"', 'index.html');
assertIncludes(indexHtml, 'href="https://jinruihub.github.io/blog/"', 'index.html');
assertIncludes(indexHtml, 'href="/blog/blog"', 'index.html');
assertIncludes(indexHtml, 'href="/blog/docs"', 'index.html');
assertIncludes(indexHtml, 'url("/blog/fonts/atkinson-regular.woff")', 'index.html');

assertIncludes(blogIndexHtml, 'href="https://jinruihub.github.io/blog/blog/"', 'blog/index.html');
assertIncludes(blogIndexHtml, 'href="/blog/blog/top/"', 'blog/index.html');
assertIncludes(blogIndexHtml, 'src="/blog/_astro/', 'blog/index.html');

assertIncludes(rssXml, '<link>https://jinruihub.github.io/blog/</link>', 'rss.xml');
assertIncludes(rssXml, '<link>https://jinruihub.github.io/blog/blog/top/</link>', 'rss.xml');
assertIncludes(sitemapIndexXml, 'https://jinruihub.github.io/blog/sitemap-0.xml', 'sitemap-index.xml');
assertIncludes(sitemapXml, 'https://jinruihub.github.io/blog/blog/top/', 'sitemap-0.xml');

for (const file of walkFiles(distDir.pathname)) {
	if (!/\.(?:html|xml)$/.test(file)) {
		continue;
	}

	const content = readFileSync(file, 'utf8');
	assertNotIncludes(content, 'https://example.com', file);
	assertNotIncludes(content, 'href="/favicon.svg"', file);
	assertNotIncludes(content, 'href="/sitemap-index.xml"', file);
	assertNotIncludes(content, 'href="/fonts/', file);
	assertNotIncludes(content, 'src="/_astro/', file);
	assertNotIncludes(content, 'url(/fonts/', file);
}
