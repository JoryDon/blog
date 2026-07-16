const BASE_PATH = import.meta.env.BASE_URL || '/';

const ABSOLUTE_URL_RE = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

function splitSuffix(path: string) {
	const match = path.match(/^([^?#]*)([?#].*)?$/);
	return {
		pathname: match?.[1] ?? path,
		suffix: match?.[2] ?? '',
	};
}

function basePrefix() {
	return BASE_PATH === '/' ? '/' : BASE_PATH.replace(/\/?$/, '/');
}

function normalizeLocalPath(path: string) {
	return path.startsWith('/') ? path.slice(1) : path;
}

function isPassthroughUrl(path: string) {
	return ABSOLUTE_URL_RE.test(path) || path.startsWith('//') || path.startsWith('#');
}

export function withBase(path: string) {
	if (!path || isPassthroughUrl(path)) {
		return path;
	}

	const { pathname, suffix } = splitSuffix(path);
	const prefix = basePrefix();
	const normalizedPath = normalizeLocalPath(pathname);

	return `${prefix}${normalizedPath}${suffix}`;
}

export function withoutBase(path: string) {
	if (!path || isPassthroughUrl(path)) {
		return path;
	}

	const { pathname, suffix } = splitSuffix(path);
	const prefix = basePrefix();

	if (prefix === '/') {
		return `${pathname || '/'}${suffix}`;
	}

	if (pathname === prefix.slice(0, -1)) {
		return `/${suffix}`;
	}

	if (pathname.startsWith(prefix)) {
		return `/${pathname.slice(prefix.length)}${suffix}`;
	}

	return `${pathname}${suffix}`;
}

export function assetWithBase(path: string) {
	return withBase(withoutBase(path));
}

export function absoluteWithBase(path: string, site: string | URL | undefined) {
	if (ABSOLUTE_URL_RE.test(path)) {
		return new URL(path);
	}

	return new URL(withBase(withoutBase(path)), site);
}

export function absoluteRouteWithBase(path: string, site: string | URL | undefined) {
	if (ABSOLUTE_URL_RE.test(path)) {
		return new URL(path);
	}

	return new URL(withBase(path), site);
}
