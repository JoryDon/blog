import { readFile } from 'node:fs/promises';

const files = [
	'dist/index.html',
	'dist/blog/index.html',
	'dist/rss.xml',
	'dist/sitemap-index.xml',
	'dist/sitemap-0.xml',
];

const contents = Object.fromEntries(
	await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')])),
);

function assertIncludes(file, expected) {
	if (!contents[file].includes(expected)) {
		throw new Error(`${file} is missing ${expected}`);
	}
}

function assertExcludes(file, unexpected) {
	if (contents[file].includes(unexpected)) {
		throw new Error(`${file} should not contain ${unexpected}`);
	}
}

for (const file of files) {
	assertExcludes(file, 'https://example.com');
}

assertIncludes('dist/index.html', 'href="/blog/"');
assertIncludes('dist/index.html', 'href="/blog/blog"');
assertIncludes('dist/index.html', 'href="/blog/docs"');
assertIncludes('dist/index.html', 'href="https://jinruihub.github.io/blog/rss.xml"');
assertIncludes('dist/index.html', 'href="/blog/sitemap-index.xml"');
assertIncludes('dist/rss.xml', '<link>https://jinruihub.github.io/blog/</link>');
assertIncludes('dist/rss.xml', 'https://jinruihub.github.io/blog/blog/');
assertIncludes('dist/sitemap-index.xml', 'https://jinruihub.github.io/blog/sitemap-0.xml');
assertIncludes('dist/sitemap-0.xml', 'https://jinruihub.github.io/blog/blog/');
