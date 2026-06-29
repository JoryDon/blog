const baseUrl = import.meta.env.BASE_URL ?? '/';
const basePath = baseUrl === '/' ? '' : baseUrl.replace(/\/$/, '');

function isExternalUrl(path: string) {
	return /^[a-z][a-z\d+\-.]*:/i.test(path) || path.startsWith('//') || path.startsWith('#');
}

function withLeadingSlash(path: string) {
	return path.startsWith('/') ? path : `/${path}`;
}

export function withBase(path: string) {
	if (isExternalUrl(path)) {
		return path;
	}

	return `${basePath}${withLeadingSlash(path)}` || '/';
}

export const assetWithBase = withBase;

export function withoutBase(path: string) {
	const normalizedPath = withLeadingSlash(path);

	if (basePath && (normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`))) {
		return normalizedPath.slice(basePath.length) || '/';
	}

	return normalizedPath;
}

export function absoluteWithBase(path: string, site: URL | string | undefined) {
	const siteUrl = site ?? 'https://jinruihub.github.io';

	return new URL(withBase(path), siteUrl);
}
