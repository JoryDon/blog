const rawBase = import.meta.env.BASE_URL || '/';
const basePath = rawBase === '/' ? '' : rawBase.replace(/\/$/, '');

function isAbsoluteUrl(path: string) {
	return /^[a-z][a-z\d+\-.]*:/i.test(path) || path.startsWith('//');
}

export function withBase(path: string) {
	if (!path || isAbsoluteUrl(path) || path.startsWith('#')) {
		return path;
	}

	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	if (!basePath) {
		return normalizedPath;
	}
	if (normalizedPath === '/') {
		return `${basePath}/`;
	}

	return `${basePath}${normalizedPath}`;
}

export function assetWithBase(path: string) {
	if (!path || isAbsoluteUrl(path) || path.startsWith('#')) {
		return path;
	}

	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	if (!basePath || normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`)) {
		return normalizedPath;
	}

	return withBase(normalizedPath);
}

export function withoutBase(path: string) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	if (!basePath || normalizedPath === basePath) {
		return normalizedPath === basePath ? '/' : normalizedPath;
	}
	if (normalizedPath.startsWith(`${basePath}/`)) {
		return normalizedPath.slice(basePath.length) || '/';
	}

	return normalizedPath;
}

export function absoluteWithBase(path: string, site: URL | string | undefined) {
	const siteUrl = site ?? 'https://jinruihub.github.io';
	return new URL(withBase(path), siteUrl).toString();
}

export function absoluteAssetWithBase(path: string, site: URL | string | undefined) {
	const siteUrl = site ?? 'https://jinruihub.github.io';
	return new URL(assetWithBase(path), siteUrl).toString();
}
