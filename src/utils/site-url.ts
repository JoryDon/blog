const site = import.meta.env.SITE ?? 'https://jinruihub.github.io';
const base = import.meta.env.BASE_URL ?? '/';

const externalUrlPattern = /^[a-z][a-z\d+\-.]*:/i;

function ensureLeadingSlash(path: string) {
	return path.startsWith('/') ? path : `/${path}`;
}

function baseWithoutTrailingSlash() {
	return base === '/' ? '' : base.replace(/\/$/, '');
}

export function withoutBase(path: string) {
	if (!path || externalUrlPattern.test(path) || path.startsWith('#')) {
		return path;
	}

	const normalizedPath = ensureLeadingSlash(path);
	const basePath = baseWithoutTrailingSlash();

	if (!basePath) return normalizedPath;
	if (normalizedPath === basePath) return '/';
	if (normalizedPath.startsWith(`${basePath}/`)) {
		return normalizedPath.slice(basePath.length) || '/';
	}

	return normalizedPath;
}

export function withBase(path: string) {
	if (!path || externalUrlPattern.test(path) || path.startsWith('#')) {
		return path;
	}

	const normalizedPath = ensureLeadingSlash(path);
	const basePath = baseWithoutTrailingSlash();

	if (!basePath) return normalizedPath;
	if (normalizedPath === '/') return `${basePath}/`;

	return `${basePath}${normalizedPath}`;
}

export function assetWithBase(path: string) {
	return withBase(path);
}

export function absoluteWithBase(path: string) {
	return new URL(withBase(withoutBase(path)), site).toString();
}
