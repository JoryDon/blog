const fallbackSite = 'https://jinruihub.github.io';

function normalizePath(path: string): string {
	if (path === '') {
		return '/';
	}

	return path.startsWith('/') ? path : `/${path}`;
}

function stripBase(path: string): string {
	const base = import.meta.env.BASE_URL;

	if (base === '/') {
		return normalizePath(path);
	}

	const normalizedPath = normalizePath(path);
	const normalizedBase = base.endsWith('/') ? base : `${base}/`;
	const baseWithoutTrailingSlash = normalizedBase.slice(0, -1);

	if (normalizedPath === baseWithoutTrailingSlash) {
		return '/';
	}

	if (normalizedPath.startsWith(normalizedBase)) {
		return normalizePath(normalizedPath.slice(baseWithoutTrailingSlash.length));
	}

	return normalizedPath;
}

export function withBase(path: string): string {
	if (/^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(path) || path.startsWith('#')) {
		return path;
	}

	const base = import.meta.env.BASE_URL;
	const normalizedPath = normalizePath(path);

	if (base === '/') {
		return normalizedPath;
	}

	const normalizedBase = base.endsWith('/') ? base : `${base}/`;
	const baseWithoutTrailingSlash = normalizedBase.slice(0, -1);

	return normalizedPath === '/' ? normalizedBase : `${baseWithoutTrailingSlash}${normalizedPath}`;
}

export function routePath(pathname: string): string {
	return stripBase(pathname);
}

export function absoluteUrl(path: string, site: string | URL | undefined): string {
	const siteUrl = site ?? fallbackSite;

	return new URL(withBase(stripBase(path)), siteUrl).toString();
}
