const base = import.meta.env.BASE_URL ?? '/';
const basePath = base === '/' ? '' : base.replace(/\/$/, '');
const siteOrigin = 'https://jinruihub.github.io';

export function withBase(path: string): string {
	if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('#')) {
		return path;
	}

	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	if (!basePath) {
		return normalizedPath;
	}

	return normalizedPath === '/' ? `${basePath}/` : `${basePath}${normalizedPath}`;
}

export function assetWithBase(path: string): string {
	return withBase(path);
}

export function withoutBase(path: string): string {
	if (!basePath) {
		return path;
	}

	if (path === basePath) {
		return '/';
	}

	if (path.startsWith(`${basePath}/`)) {
		return path.slice(basePath.length) || '/';
	}

	return path;
}

export function absoluteWithBase(path: string): string {
	if (/^(?:[a-z]+:)?\/\//i.test(path)) {
		return path;
	}

	return new URL(withBase(path), siteOrigin).toString();
}
