const BASE_PATH = normalizeBase(import.meta.env.BASE_URL);

function normalizeBase(base: string | undefined) {
	if (!base || base === '/') {
		return '';
	}

	const withLeadingSlash = base.startsWith('/') ? base : `/${base}`;
	return withLeadingSlash.endsWith('/') ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
}

function isExternalUrl(path: string) {
	return /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(path) || /^[a-z][a-z\d+\-.]*:/i.test(path);
}

function normalizePath(path: string) {
	if (!path) {
		return '/';
	}

	return path.startsWith('/') ? path : `/${path}`;
}

function hasBase(path: string) {
	return BASE_PATH !== '' && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`));
}

export function withBase(path: string) {
	if (isExternalUrl(path) || path.startsWith('#')) {
		return path;
	}

	const normalizedPath = normalizePath(path);
	if (!BASE_PATH) {
		return normalizedPath;
	}

	return normalizedPath === '/' ? `${BASE_PATH}/` : `${BASE_PATH}${normalizedPath}`;
}

export function assetWithBase(path: string) {
	if (isExternalUrl(path) || path.startsWith('#')) {
		return path;
	}

	const normalizedPath = normalizePath(path);
	if (!BASE_PATH || hasBase(normalizedPath)) {
		return normalizedPath;
	}

	return normalizedPath === '/' ? `${BASE_PATH}/` : `${BASE_PATH}${normalizedPath}`;
}

export function withoutBase(path: string) {
	const normalizedPath = normalizePath(path);
	if (!hasBase(normalizedPath)) {
		return normalizedPath;
	}

	const strippedPath = normalizedPath.slice(BASE_PATH.length);
	return strippedPath === '' ? '/' : strippedPath;
}

export function absoluteWithBase(path: string, site: string | URL | undefined) {
	if (!site) {
		return withBase(path);
	}

	return new URL(withBase(path), site).toString();
}

export function absoluteAssetWithBase(path: string, site: string | URL | undefined) {
	if (!site) {
		return assetWithBase(path);
	}

	return new URL(assetWithBase(path), site).toString();
}
