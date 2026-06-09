const baseUrl = import.meta.env.BASE_URL;

function normalizedBase() {
	return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function normalizedPath(path: string) {
	return `/${path.replace(/^\/+/, '')}`;
}

export function stripBase(path: string) {
	const base = normalizedBase();
	const pathname = normalizedPath(path);

	if (base === '/') {
		return pathname;
	}

	if (pathname === base.slice(0, -1)) {
		return '/';
	}

	if (pathname.startsWith(base)) {
		return normalizedPath(pathname.slice(base.length));
	}

	return pathname;
}

export function withBase(path = '/') {
	if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('#') || path.startsWith('mailto:')) {
		return path;
	}

	const base = normalizedBase();
	const pathname = normalizedPath(path);

	if (pathname === '/') {
		return base;
	}

	return `${base}${pathname.replace(/^\/+/, '')}`;
}

export function absoluteUrl(path: string, site: URL | string | undefined) {
	if (!site) {
		throw new Error('Astro site config is required to build absolute URLs.');
	}

	return new URL(withBase(path), site).toString();
}
