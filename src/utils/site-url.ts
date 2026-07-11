export const SITE_ORIGIN = 'https://jinruihub.github.io';

const BASE_URL = import.meta.env.BASE_URL || '/';
const basePath = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

const hasProtocol = (value: string) => /^[a-z][a-z0-9+.-]*:/i.test(value);

export function withBase(path: string): string {
	if (!path || hasProtocol(path) || path.startsWith('//') || path.startsWith('#')) {
		return path;
	}

	const routePath = path.startsWith('/') ? path : `/${path}`;

	if (!basePath) {
		return routePath;
	}

	return routePath === '/' ? `${basePath}/` : `${basePath}${routePath}`;
}

export function withoutBase(path: string): string {
	if (!basePath) {
		return path;
	}

	if (path === basePath) {
		return '/';
	}

	return path.startsWith(`${basePath}/`) ? path.slice(basePath.length) : path;
}

export const assetWithBase = withBase;

export function absoluteWithBase(path: string): string {
	if (hasProtocol(path) || path.startsWith('//')) {
		return path;
	}

	return new URL(withBase(withoutBase(path)), SITE_ORIGIN).toString();
}

export function absoluteRouteWithBase(path: string): string {
	return new URL(withBase(path), SITE_ORIGIN).toString();
}
