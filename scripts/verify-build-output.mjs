import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);

function readDistFile(relativePath) {
	const fileUrl = new URL(relativePath, distDir);
	if (!existsSync(fileUrl)) {
		throw new Error(`Expected build output missing: ${relativePath}`);
	}
	return readFileSync(fileUrl, 'utf8');
}

function assertIncludes(content, expected, label) {
	if (!content.includes(expected)) {
		throw new Error(`${label} did not include expected content: ${expected}`);
	}
}

function assertNotIncludes(content, unexpected, label) {
	if (content.includes(unexpected)) {
		throw new Error(`${label} included unexpected content: ${unexpected}`);
	}
}

function collectFiles(dirUrl, extension) {
	const dirPath = dirUrl.pathname;
	const files = [];
	for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
		const entryPath = join(dirPath, entry.name);
		if (entry.isDirectory()) {
			files.push(...collectFiles(new URL(`${entry.name}/`, dirUrl), extension));
		} else if (entry.isFile() && entry.name.endsWith(extension)) {
			files.push(entryPath);
		}
	}
	return files;
}

const home = readDistFile('index.html');
const blogIndex = readDistFile('blog/index.html');
const docsIndex = readDistFile('docs/index.html');
const rss = readDistFile('rss.xml');
const sitemapIndex = readDistFile('sitemap-index.xml');
const sitemap = readDistFile('sitemap-0.xml');

assertIncludes(home, 'href="/blog/"', 'home header');
assertIncludes(home, 'href="/blog/blog"', 'home blog nav');
assertIncludes(home, 'href="/blog/docs"', 'home docs nav');
assertIncludes(home, 'href="/blog/favicon.svg"', 'home favicon');
assertIncludes(home, 'href="/blog/sitemap-index.xml"', 'home sitemap link');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/rss.xml"', 'home rss link');
assertIncludes(home, 'href="/blog/fonts/atkinson-regular.woff"', 'home regular font preload');
assertIncludes(home, 'url("/blog/fonts/atkinson-regular.woff")', 'home regular font face');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/"', 'home canonical');

assertIncludes(blogIndex, 'href="/blog/blog/first/"', 'blog first post link');
assertIncludes(blogIndex, 'href="/blog/blog/chinese/sanzijing/"', 'blog nested post link');
assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs guide link');
assertIncludes(docsIndex, 'href="/blog/docs/reference/example/"', 'docs reference link');

assertIncludes(rss, 'https://jinruihub.github.io/blog/', 'rss channel link');
assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/first/', 'rss item link');
assertIncludes(sitemapIndex, 'https://jinruihub.github.io/blog/sitemap-0.xml', 'sitemap index');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/', 'sitemap home URL');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/blog/first/', 'sitemap blog URL');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/docs/guides/example/', 'sitemap docs URL');

const generatedText = [
	home,
	blogIndex,
	docsIndex,
	rss,
	sitemapIndex,
	sitemap,
	...collectFiles(distDir, '.css').map((filePath) => readFileSync(filePath, 'utf8')),
].join('\n');

for (const unexpected of [
	'https://example.com',
	'href="/favicon.svg"',
	'href="/sitemap-index.xml"',
	'href="/rss.xml"',
	'href="/fonts/',
	'url("/fonts/',
	'url(/fonts/',
	'href="/docs',
	'href="/blog/first/',
	'https://jinruihub.github.io/blog/first/',
]) {
	assertNotIncludes(generatedText, unexpected, 'generated output');
}

console.log('Build output uses the GitHub Pages /blog/ base path.');
