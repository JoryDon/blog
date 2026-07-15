import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const distDirectory = new URL('../dist/', import.meta.url);
const productionOrigin = 'https://jinrui.netlify.app';

async function collectFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(
		entries.map((entry) => {
			const entryPath = path.join(directory, entry.name);
			return entry.isDirectory() ? collectFiles(entryPath) : entryPath;
		}),
	);

	return files.flat();
}

const generatedFiles = await collectFiles(distDirectory);
const textFiles = generatedFiles.filter((file) => /\.(?:html|xml)$/.test(file));

for (const file of textFiles) {
	const contents = await readFile(file, 'utf8');
	assert.equal(
		contents.includes('https://example.com'),
		false,
		`${path.relative(distDirectory.pathname, file)} still contains the placeholder origin`,
	);
}

const index = await readFile(new URL('index.html', distDirectory), 'utf8');
assert.match(index, /<link rel="canonical" href="https:\/\/jinrui\.netlify\.app\/">/);
assert.match(index, /href="https:\/\/jinrui\.netlify\.app\/rss\.xml"/);

const rss = await readFile(new URL('rss.xml', distDirectory), 'utf8');
assert.match(rss, /<channel>.*?<link>https:\/\/jinrui\.netlify\.app\/<\/link>/s);

const rssItemLinks = [...rss.matchAll(/<item>.*?<link>([^<]+)<\/link>/gs)].map(
	(match) => match[1],
);
assert.ok(rssItemLinks.length > 0, 'RSS output must include blog posts');
assert.ok(
	rssItemLinks.every((link) => link.startsWith(`${productionOrigin}/blog/`)),
	`RSS contains an invalid item URL: ${rssItemLinks.join(', ')}`,
);

const sitemapIndex = await readFile(new URL('sitemap-index.xml', distDirectory), 'utf8');
assert.match(
	sitemapIndex,
	/<loc>https:\/\/jinrui\.netlify\.app\/sitemap-\d+\.xml<\/loc>/,
);

const sitemap = await readFile(new URL('sitemap-0.xml', distDirectory), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.ok(sitemapUrls.length > 0, 'Sitemap output must include site pages');
assert.ok(
	sitemapUrls.every((url) => url.startsWith(`${productionOrigin}/`)),
	`Sitemap contains an invalid URL: ${sitemapUrls.join(', ')}`,
);

console.log(`Verified ${textFiles.length} generated HTML/XML files use ${productionOrigin}.`);
