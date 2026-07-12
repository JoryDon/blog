const baseUrl = import.meta.env.BASE_URL || '/';
const siteOrigin = 'https://jinruihub.github.io';

const ensureTrailingSlash = (value: string) => (value.endsWith('/') ? value : `${value}/`);

const normalizedBase = ensureTrailingSlash(baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`);

const passthroughPattern = /^(?:[a-z][a-z0-9+.-]*:|#)/i;

function normalizeRootPath(path: string) {
	if (!path || path === '/') {
		return '';
	}

	return path.startsWith('/') ? path.slice(1) : path;
}

export function withBase(path: string) {
	if (passthroughPattern.test(path)) {
		return path;
	}

	return `${normalizedBase}${normalizeRootPath(path)}`;
}

export function assetWithBase(path: string) {
	return withBase(path);
}

export function withoutBase(path: string) {
	if (path === normalizedBase.slice(0, -1)) {
		return '/';
	}

	if (path.startsWith(normalizedBase)) {
		return `/${path.slice(normalizedBase.length)}`;
	}

	return path;
}

export function absoluteWithBase(path: string, site: URL | string = siteOrigin) {
	return new URL(withBase(path), site).href;
}
