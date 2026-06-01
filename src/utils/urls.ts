const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:\/\//i;

function normalizedBase() {
	const base = import.meta.env.BASE_URL || '/';
	return base === '/' ? '' : base.replace(/\/$/, '');
}

export function withBase(path: string) {
	if (ABSOLUTE_URL_PATTERN.test(path) || path.startsWith('#') || path.startsWith('mailto:')) {
		return path;
	}

	const base = normalizedBase();
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return normalizedPath === '/' ? `${base}/` || '/' : `${base}${normalizedPath}`;
}

export function withoutBase(path: string) {
	const base = normalizedBase();
	if (!base) return path || '/';
	if (path === base) return '/';
	if (path.startsWith(`${base}/`)) return path.slice(base.length) || '/';
	return path || '/';
}

export function withSite(path: string, site: URL | string | undefined) {
	const url = withBase(path);
	return site ? new URL(url, site).toString() : url;
}
