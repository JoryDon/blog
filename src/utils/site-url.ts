const configuredBase = import.meta.env.BASE_URL || '/';

function splitPathSuffix(path: string) {
	const match = path.match(/^([^?#]*)(.*)$/);
	return {
		pathname: match?.[1] ?? path,
		suffix: match?.[2] ?? '',
	};
}

function isSpecialUrl(path: string) {
	return /^(?:[a-z][a-z\d+\-.]*:|\/\/|#)/i.test(path);
}

function normalizeBase(base: string) {
	if (!base || base === '/') return '/';
	const trimmed = base.replace(/^\/+|\/+$/g, '');
	return `/${trimmed}/`;
}

export const basePath = normalizeBase(configuredBase);

export function withBase(path: string) {
	if (!path || isSpecialUrl(path)) return path;
	const { pathname, suffix } = splitPathSuffix(path);
	const normalizedPath = pathname.replace(/^\/+/, '');

	if (basePath === '/') {
		return `/${normalizedPath}${suffix}`;
	}

	return `${basePath}${normalizedPath}${suffix}`;
}

export function withoutBase(path: string) {
	if (!path || isSpecialUrl(path) || basePath === '/') return path;

	const { pathname, suffix } = splitPathSuffix(path);
	const baseWithoutTrailingSlash = basePath.replace(/\/$/, '');

	if (pathname === baseWithoutTrailingSlash || pathname === basePath) {
		return `/${suffix}`;
	}

	if (pathname.startsWith(basePath)) {
		return `/${pathname.slice(basePath.length)}${suffix}`;
	}

	return path;
}

export function assetWithBase(path: string) {
	return withBase(path);
}

export function absoluteWithBase(path: string, site: string | URL | undefined) {
	if (!site) return withBase(withoutBase(path));
	if (isSpecialUrl(path) && !path.startsWith('//')) return path;

	return new URL(withBase(withoutBase(path)), site).toString();
}

export function absoluteRouteWithBase(path: string, site: string | URL | undefined) {
	if (!site) return withBase(path);
	if (isSpecialUrl(path) && !path.startsWith('//')) return path;

	return new URL(withBase(path), site).toString();
}
