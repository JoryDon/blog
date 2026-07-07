import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);

function read(relativePath) {
	const file = new URL(relativePath, dist);
	if (!existsSync(file)) {
		throw new Error(`Expected build output ${relativePath} to exist`);
	}

	return readFileSync(file, 'utf8');
}

function assertContains(file, value) {
	const content = read(file);
	if (!content.includes(value)) {
		throw new Error(`Expected ${file} to contain ${value}`);
	}
}

function assertNotContains(file, value) {
	const content = read(file);
	if (content.includes(value)) {
		throw new Error(`Expected ${file} not to contain ${value}`);
	}
}

function assertNoRootRelativeLeak(file) {
	const content = read(file);
	const leaks = [...content.matchAll(/\s(?:href|src)="\/(?!blog(?:\/|"))[^"]*"/g)].map(
		(match) => match[0].trim(),
	);

	if (leaks.length > 0) {
		throw new Error(`Expected ${file} to avoid root-relative URLs outside /blog/: ${leaks.join(', ')}`);
	}
}

const expectedFiles = [
	'index.html',
	'blog/index.html',
	'blog/first/index.html',
	'docs/index.html',
	'docs/guides/example/index.html',
	'rss.xml',
	'sitemap-index.xml',
	'sitemap-0.xml',
	join('_astro'),
];

for (const file of expectedFiles) {
	const path = new URL(file, dist);
	if (!existsSync(path)) {
		throw new Error(`Expected ${file} to be generated`);
	}
}

assertContains('index.html', 'href="/blog/"');
assertContains('index.html', 'href="/blog/blog"');
assertContains('index.html', 'href="/blog/docs"');
assertContains('index.html', 'href="/blog/favicon.svg"');
assertContains('index.html', 'href="/blog/sitemap-index.xml"');
assertContains('index.html', 'href="https://jinruihub.github.io/blog/rss.xml"');
assertContains('index.html', 'href="https://jinruihub.github.io/blog/"');
assertContains('index.html', 'url("/blog/fonts/atkinson-regular.woff")');
assertContains('index.html', 'url("/blog/fonts/atkinson-bold.woff")');
assertNotContains('index.html', 'https://example.com');
assertNoRootRelativeLeak('index.html');

assertContains('blog/index.html', 'href="/blog/blog/first/"');
assertContains('blog/index.html', 'href="/blog/blog/chinese/sanzijing/"');
assertContains('blog/index.html', 'href="https://jinruihub.github.io/blog/blog/"');
assertNoRootRelativeLeak('blog/index.html');

assertContains('docs/index.html', 'href="/blog/docs/guides/example/"');
assertContains('docs/index.html', 'href="/blog/docs/reference/example/"');
assertContains('docs/index.html', 'href="https://jinruihub.github.io/blog/docs/"');
assertNoRootRelativeLeak('docs/index.html');

assertContains('blog/first/index.html', 'href="https://jinruihub.github.io/blog/blog/first/"');
assertContains('docs/guides/example/index.html', 'href="https://jinruihub.github.io/blog/docs/guides/example/"');

assertContains('rss.xml', 'https://jinruihub.github.io/blog/blog/first/');
assertContains('rss.xml', 'https://jinruihub.github.io/blog/blog/chinese/sanzijing/');
assertNotContains('rss.xml', 'https://example.com');

assertContains('sitemap-index.xml', 'https://jinruihub.github.io/blog/sitemap-0.xml');
assertContains('sitemap-0.xml', 'https://jinruihub.github.io/blog/');
assertContains('sitemap-0.xml', 'https://jinruihub.github.io/blog/blog/first/');
assertContains('sitemap-0.xml', 'https://jinruihub.github.io/blog/docs/guides/example/');
assertNotContains('sitemap-0.xml', 'https://example.com');

console.log('Build output URLs are base-aware.');
