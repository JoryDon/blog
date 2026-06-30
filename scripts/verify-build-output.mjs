import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);
const distPath = fileURLToPath(distDir);

function readDist(relativePath) {
	const filePath = new URL(relativePath, distDir);
	if (!existsSync(filePath)) {
		throw new Error(`Expected build output to exist: ${relativePath}`);
	}

	return readFileSync(filePath, 'utf8');
}

function readAllFiles(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const entryPath = join(directory, entry.name);
		if (entry.isDirectory()) {
			return readAllFiles(entryPath);
		}

		if (!/\.(?:css|html|js|json|txt|xml)$/i.test(entry.name)) {
			return [];
		}

		return readFileSync(entryPath, 'utf8');
	});
}

function assertIncludes(content, expected, label) {
	if (!content.includes(expected)) {
		throw new Error(`${label} did not include expected output: ${expected}`);
	}
}

function assertNotIncludes(content, unexpected, label) {
	if (content.includes(unexpected)) {
		throw new Error(`${label} included unexpected output: ${unexpected}`);
	}
}

function assertNotMatches(content, unexpected, label) {
	if (unexpected.test(content)) {
		throw new Error(`${label} matched unexpected output: ${unexpected}`);
	}
}

const allOutput = readAllFiles(distPath).join('\n');
const home = readDist('index.html');
const blogIndex = readDist('blog/index.html');
const docsIndex = readDist('docs/index.html');
const rss = readDist('rss.xml');
const sitemapIndex = readDist('sitemap-index.xml');
const sitemap = readDist('sitemap-0.xml');

assertNotIncludes(allOutput, 'https://example.com', 'build output');
assertNotIncludes(allOutput, 'href="/favicon.svg"', 'build output');
assertNotIncludes(allOutput, 'href="/fonts/', 'build output');
assertNotIncludes(allOutput, 'url(/fonts/', 'build output');
assertNotIncludes(allOutput, 'href="/"', 'build output');
assertNotMatches(allOutput, /href="\/blog(?:["?#]|\/(?!["?#]|blog(?:\/|["?#])))/, 'build output');
assertNotMatches(allOutput, /href="\/docs(?:[/"?#])/, 'build output');
assertNotIncludes(allOutput, '/blog/blog/_astro/', 'build output');

assertIncludes(home, 'href="/blog/"', 'home page');
assertIncludes(home, 'href="/blog/blog"', 'home page');
assertIncludes(home, 'href="/blog/docs"', 'home page');
assertIncludes(home, 'href="/blog/favicon.svg"', 'home page');
assertIncludes(home, 'href="/blog/fonts/atkinson-regular.woff"', 'home page');
assertIncludes(home, 'url("/blog/fonts/atkinson-regular.woff")', 'home page');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/rss.xml"', 'home page');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/"', 'home page canonical');
assertIncludes(home, 'content="https://jinruihub.github.io/blog/"', 'home page metadata');
assertIncludes(home, 'content="https://jinruihub.github.io/blog/_astro/', 'home page image metadata');

assertIncludes(blogIndex, 'href="/blog/blog/first/"', 'blog index');
assertIncludes(docsIndex, 'href="/blog/docs/index/"', 'docs index');

assertIncludes(rss, '<link>https://jinruihub.github.io/blog/</link>', 'RSS channel');
assertIncludes(rss, '<link>https://jinruihub.github.io/blog/blog/first/</link>', 'RSS items');

assertIncludes(sitemapIndex, '<loc>https://jinruihub.github.io/blog/sitemap-0.xml</loc>', 'sitemap index');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/</loc>', 'sitemap');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/blog/first/</loc>', 'sitemap');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/docs/</loc>', 'sitemap');

console.log('Build output verification passed.');
