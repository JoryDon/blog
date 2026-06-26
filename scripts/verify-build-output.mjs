import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);

function readDistFile(path) {
	const fileUrl = new URL(path, distDir);
	if (!existsSync(fileUrl)) {
		throw new Error(`Missing build output: ${path}`);
	}

	return readFileSync(fileUrl, 'utf8');
}

function walkFiles(dirUrl) {
	const entries = readdirSync(dirUrl, { withFileTypes: true });
	return entries.flatMap((entry) => {
		const entryPath = join(dirUrl.pathname, entry.name);
		if (entry.isDirectory()) {
			return walkFiles(new URL(`${entry.name}/`, dirUrl));
		}

		return entryPath;
	});
}

function assertIncludes(content, expected, file) {
	if (!content.includes(expected)) {
		throw new Error(`${file} does not include ${expected}`);
	}
}

function assertNotIncludes(content, unexpected, file) {
	if (content.includes(unexpected)) {
		throw new Error(`${file} unexpectedly includes ${unexpected}`);
	}
}

function assertNoMatch(content, unexpected, file) {
	if (unexpected.test(content)) {
		throw new Error(`${file} unexpectedly matches ${unexpected}`);
	}
}

const textOutputFiles = walkFiles(distDir).filter((file) => /\.(html|xml)$/.test(file));
for (const file of textOutputFiles) {
	const content = readFileSync(file, 'utf8');
	assertNotIncludes(content, 'https://example.com', file);
	assertNoMatch(content, /href="\/(?=["?#])/g, file);
	assertNoMatch(content, /href="\/blog(?=["?#])/g, file);
	assertNoMatch(content, /href="\/docs(?=["?#])/g, file);
	assertNoMatch(content, /href="\/favicon\.svg(?=["?#])/g, file);
	assertNoMatch(content, /href="\/sitemap-index\.xml(?=["?#])/g, file);
	assertNoMatch(content, /href="\/fonts\//g, file);
	assertNotIncludes(content, 'url(/fonts/', file);
	assertNotIncludes(content, 'url("/fonts/', file);
}

const home = readDistFile('index.html');
assertIncludes(home, 'href="/blog/"', 'index.html');
assertIncludes(home, 'href="/blog/blog"', 'index.html');
assertIncludes(home, 'href="/blog/docs"', 'index.html');
assertIncludes(home, 'href="/blog/favicon.svg"', 'index.html');
assertIncludes(home, 'href="/blog/fonts/atkinson-regular.woff"', 'index.html');
assertIncludes(home, 'url("/blog/fonts/atkinson-regular.woff")', 'index.html');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/rss.xml"', 'index.html');
assertIncludes(home, 'href="https://jinruihub.github.io/blog/"', 'index.html');

const blogIndex = readDistFile('blog/index.html');
assertIncludes(blogIndex, 'href="/blog/blog/first/"', 'blog/index.html');
assertIncludes(blogIndex, 'href="/blog/blog/chinese/sanzijing/"', 'blog/index.html');

const docsIndex = readDistFile('docs/index.html');
assertIncludes(docsIndex, 'href="/blog/docs/guides/example/"', 'docs/index.html');
assertIncludes(docsIndex, 'href="/blog/docs/reference/example/"', 'docs/index.html');

const rss = readDistFile('rss.xml');
assertIncludes(rss, '<link>https://jinruihub.github.io/blog/</link>', 'rss.xml');
assertIncludes(rss, '<link>https://jinruihub.github.io/blog/blog/first/</link>', 'rss.xml');
assertIncludes(rss, '<link>https://jinruihub.github.io/blog/blog/chinese/sanzijing/</link>', 'rss.xml');

const sitemapIndex = readDistFile('sitemap-index.xml');
assertIncludes(
	sitemapIndex,
	'<loc>https://jinruihub.github.io/blog/sitemap-0.xml</loc>',
	'sitemap-index.xml',
);

const sitemap = readDistFile('sitemap-0.xml');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/</loc>', 'sitemap-0.xml');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/blog/first/</loc>', 'sitemap-0.xml');
assertIncludes(sitemap, '<loc>https://jinruihub.github.io/blog/docs/</loc>', 'sitemap-0.xml');

console.log(`Verified ${textOutputFiles.length} build output files for GitHub Pages base URLs.`);
