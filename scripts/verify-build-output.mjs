import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const distDir = new URL('../dist/', import.meta.url).pathname;
const siteUrl = 'https://jinruihub.github.io';
const basePath = '/blog/';

function fail(message) {
	console.error(`Build output verification failed: ${message}`);
	process.exit(1);
}

function assert(condition, message) {
	if (!condition) {
		fail(message);
	}
}

function readDistFile(path) {
	const filePath = join(distDir, path);
	assert(existsSync(filePath), `missing dist/${path}`);
	return readFileSync(filePath, 'utf8');
}

function walkFiles(dir) {
	return readdirSync(dir).flatMap((entry) => {
		const filePath = join(dir, entry);
		return statSync(filePath).isDirectory() ? walkFiles(filePath) : [filePath];
	});
}

const checkedFiles = walkFiles(distDir).filter((filePath) =>
	/\.(?:html|xml|css)$/.test(filePath),
);
const combinedOutput = checkedFiles
	.map((filePath) => `\n--- ${relative(distDir, filePath)} ---\n${readFileSync(filePath, 'utf8')}`)
	.join('\n');

const home = readDistFile('index.html');
const blogIndex = readDistFile('blog/index.html');
const docsIndex = readDistFile('docs/index.html');
const rss = readDistFile('rss.xml');
const sitemapIndex = readDistFile('sitemap-index.xml');
const sitemap = readDistFile('sitemap-0.xml');

assert(!combinedOutput.includes('https://example.com'), 'template example.com leaked into dist');
assert(home.includes(`href="${basePath}"`), 'home page does not link the site title to /blog/');
assert(home.includes(`href="${basePath}blog/"`), 'home page does not link to /blog/blog/');
assert(home.includes(`href="${basePath}docs/"`), 'home page does not link to /blog/docs/');
assert(home.includes(`href="${basePath}favicon.svg"`), 'favicon URL is not base-prefixed');
assert(
	home.includes(`href="${basePath}fonts/atkinson-regular.woff"`) &&
		home.includes(`href="${basePath}fonts/atkinson-bold.woff"`),
	'font preload URLs are not base-prefixed',
);
assert(
	blogIndex.includes(`href="${basePath}blog/first/"`) &&
		blogIndex.includes(`href="${basePath}blog/chinese/sanzijing/"`),
	'blog post links are not base-prefixed',
);
assert(
	docsIndex.includes(`href="${basePath}docs/index/"`) &&
		docsIndex.includes(`href="${basePath}docs/reference/example/"`),
	'docs links are not base-prefixed',
);
assert(
	rss.includes(`<link>${siteUrl}${basePath}</link>`) &&
		rss.includes(`<link>${siteUrl}${basePath}blog/first/</link>`),
	'RSS channel or item links are not using the production base path',
);
assert(
	sitemapIndex.includes(`<loc>${siteUrl}${basePath}sitemap-0.xml</loc>`) &&
		sitemap.includes(`<loc>${siteUrl}${basePath}blog/first/</loc>`),
	'sitemap URLs are not using the production base path',
);

const rootAbsoluteReferencePattern = /\b(?:href|src)=["']\/(?!blog(?:\/|["']))/g;
const cssRootUrlPattern = /url\(["']?\/(?!blog\/)/g;

assert(
	!rootAbsoluteReferencePattern.test(combinedOutput),
	'found root-absolute href/src values that would escape the GitHub Pages project path',
);
assert(
	!cssRootUrlPattern.test(combinedOutput),
	'found root-absolute CSS url() values that would escape the GitHub Pages project path',
);

console.log(`Verified ${checkedFiles.length} generated HTML/XML/CSS files for ${siteUrl}${basePath}`);
