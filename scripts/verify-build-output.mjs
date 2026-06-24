import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url).pathname;

function readOutput(relativePath) {
	const fullPath = join(distDir, relativePath);
	if (!existsSync(fullPath)) {
		throw new Error(`Expected build output ${relativePath} to exist`);
	}

	return readFileSync(fullPath, 'utf8');
}

function assertIncludes(content, expected, label) {
	if (!content.includes(expected)) {
		throw new Error(`${label} is missing ${expected}`);
	}
}

function assertNotIncludes(content, unexpected, label) {
	if (content.includes(unexpected)) {
		throw new Error(`${label} unexpectedly contains ${unexpected}`);
	}
}

const home = readOutput('index.html');
const blogIndex = readOutput('blog/index.html');
const docsIndex = readOutput('docs/index.html');
const rss = readOutput('rss.xml');
const sitemapIndex = readOutput('sitemap-index.xml');
const sitemap = readOutput('sitemap-0.xml');
const combinedOutput = [home, blogIndex, docsIndex, rss, sitemapIndex, sitemap].join('\n');

assertIncludes(home, 'href="/blog/"', 'home page navigation');
assertIncludes(home, 'href="/blog/blog"', 'home page blog navigation');
assertIncludes(home, 'href="/blog/docs"', 'home page docs navigation');
assertIncludes(home, 'href="/blog/favicon.svg"', 'home page favicon');
assertIncludes(home, 'href="/blog/fonts/atkinson-regular.woff"', 'home page regular font preload');
assertIncludes(home, 'href="/blog/fonts/atkinson-bold.woff"', 'home page bold font preload');
assertIncludes(home, 'url("/blog/fonts/atkinson-regular.woff")', 'home page regular font face');
assertIncludes(home, 'url("/blog/fonts/atkinson-bold.woff")', 'home page bold font face');
assertIncludes(home, 'https://jinruihub.github.io/blog/', 'home page canonical metadata');
assertIncludes(home, 'https://jinruihub.github.io/blog/rss.xml', 'home page RSS metadata');

assertIncludes(blogIndex, 'href="/blog/blog/', 'blog list post links');
assertIncludes(docsIndex, 'href="/blog/docs/', 'docs list links');
assertIncludes(rss, 'https://jinruihub.github.io/blog/blog/', 'RSS item links');
assertIncludes(sitemapIndex, 'https://jinruihub.github.io/blog/sitemap-0.xml', 'sitemap index');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/blog/', 'sitemap blog URLs');
assertIncludes(sitemap, 'https://jinruihub.github.io/blog/docs/', 'sitemap docs URLs');

assertNotIncludes(combinedOutput, 'https://example.com', 'build output');
assertNotIncludes(combinedOutput, 'href="/favicon.svg"', 'build output');
assertNotIncludes(combinedOutput, 'href="/sitemap-index.xml"', 'build output');
assertNotIncludes(combinedOutput, 'href="/fonts/', 'build output');
assertNotIncludes(combinedOutput, 'url("/fonts/', 'build output');

console.log('Build output uses the GitHub Pages /blog/ base path.');
