const siteBase = import.meta.env.BASE_URL || '/';

function normalizeBase(base: string) {
	if (!base.startsWith('/')) {
		base = `/${base}`;
	}

	return base.endsWith('/') ? base : `${base}/`;
}

const normalizedBase = normalizeBase(siteBase);

export function withBase(path = '/') {
	if (/^[a-z][a-z\d+\-.]*:/i.test(path) || path.startsWith('//')) {
		return path;
	}

	const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
	return normalizedPath ? `${normalizedBase}${normalizedPath}` : normalizedBase;
}

export function withoutBase(pathname: string) {
	if (normalizedBase === '/') {
		return pathname;
	}

	const baseWithoutTrailingSlash = normalizedBase.slice(0, -1);
	if (pathname === baseWithoutTrailingSlash || pathname === normalizedBase) {
		return '/';
	}

	if (pathname.startsWith(normalizedBase)) {
		return `/${pathname.slice(normalizedBase.length)}`;
	}

	return pathname;
}

export function assetWithBase(path = '/') {
	if (/^[a-z][a-z\d+\-.]*:/i.test(path) || path.startsWith('//')) {
		return path;
	}

	if (normalizedBase !== '/' && (path === normalizedBase.slice(0, -1) || path.startsWith(normalizedBase))) {
		return path;
	}

	return withBase(path);
}

export function absoluteWithBase(path: string, site: URL | string) {
	return new URL(withBase(path), site).toString();
}

export function absoluteAssetWithBase(path: string, site: URL | string) {
	return new URL(assetWithBase(path), site).toString();
}
