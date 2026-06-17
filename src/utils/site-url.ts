const BASE_URL = import.meta.env.BASE_URL;

const EXTERNAL_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;
const SPECIAL_URL_PATTERN = /^(?:mailto:|tel:|data:|#)/i;

export function withBase(path = '/'): string {
	if (EXTERNAL_URL_PATTERN.test(path) || SPECIAL_URL_PATTERN.test(path)) {
		return path;
	}

	const base = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
	const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

	return `${base}${normalizedPath}`;
}

export function assetWithBase(path: string): string {
	if (EXTERNAL_URL_PATTERN.test(path) || SPECIAL_URL_PATTERN.test(path)) {
		return path;
	}

	if (BASE_URL === '/' || path.startsWith(BASE_URL)) {
		return path;
	}

	return withBase(path);
}

export function absoluteWithBase(path: string, site: URL | string): URL {
	return new URL(assetWithBase(path), site);
}
