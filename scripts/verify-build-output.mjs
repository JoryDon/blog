import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url).pathname;
const expectedSite = 'https://jinruihub.github.io/blog/';
const expectedBase = '/blog/';

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function readDistFile(filePath) {
	const fullPath = join(distDir, filePath);
	assert(existsSync(fullPath), `Missing build output: ${filePath}`);
	return readFileSync(fullPath, 'utf8');
}

function listTextOutputs(directory = distDir) {
	return readdirSync(directory).flatMap((entry) => {
		const fullPath = join(directory, entry);
		if (statSync(fullPath).isDirectory()) {
			return listTextOutputs(fullPath);
		}
		return /\.(html|xml|css|js)$/.test(entry) ? [fullPath] : [];
	});
}

const textOutputs = listTextOutputs();
const combinedOutput = textOutputs.map((filePath) => readFileSync(filePath, 'utf8')).join('\n');

assert(!combinedOutput.includes('https://example.com'), 'Build output still references example.com.');
assert(
	!/\b(?:href|src)=["']\/(?!blog(?:\/|["']))/.test(combinedOutput),
	'Build output contains root-relative href/src values outside /blog/.',
);
assert(
	!/url\(["']?\/(?!blog\/)/.test(combinedOutput),
	'Build output contains root-relative CSS url() values outside /blog/.',
);

const home = readDistFile('index.html');
assert(home.includes(`href="${expectedBase}"`), 'Home link is not base-aware.');
assert(home.includes(`href="${expectedBase}blog/"`), 'Blog navigation link is not base-aware.');
assert(home.includes(`href="${expectedBase}docs/"`), 'Docs navigation link is not base-aware.');
assert(home.includes(`href="${expectedBase}favicon.svg"`), 'Favicon link is not base-aware.');
assert(home.includes(`href="${expectedBase}fonts/atkinson-regular.woff"`), 'Font preload is not base-aware.');
assert(home.includes(`href="${expectedSite}"`), 'Canonical home URL does not include the deployed base path.');
assert(home.includes(`href="${expectedSite}rss.xml"`), 'RSS alternate link does not include the deployed base path.');
assert(home.includes(`url(${expectedBase}fonts/atkinson-regular.woff)`), 'Font CSS URL is not base-aware.');

const rss = readDistFile('rss.xml');
assert(rss.includes(`<link>${expectedSite}</link>`), 'RSS channel link does not include the deployed base path.');
assert(rss.includes(`<link>${expectedSite}blog/first/</link>`), 'RSS item link does not include the deployed base path.');

const sitemapIndex = readDistFile('sitemap-index.xml');
const sitemap = readDistFile('sitemap-0.xml');
assert(sitemapIndex.includes(`${expectedSite}sitemap-0.xml`), 'Sitemap index does not include the deployed base path.');
assert(sitemap.includes(`<loc>${expectedSite}</loc>`), 'Sitemap home URL does not include the deployed base path.');
assert(sitemap.includes(`<loc>${expectedSite}blog/first/</loc>`), 'Sitemap blog URL does not include the deployed base path.');

console.log('Build output URLs are correctly rooted under /blog/.');
