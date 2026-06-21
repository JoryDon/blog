const siteOrigin = 'https://jinruihub.github.io';
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function isAbsoluteUrl(path: string) {
	return /^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//');
}

function ensureLeadingSlash(path: string) {
	return path.startsWith('/') ? path : `/${path}`;
}

export function withoutBase(path: string) {
	if (!basePath) {
		return ensureLeadingSlash(path);
	}

	if (path === basePath) {
		return '/';
	}

	if (path.startsWith(`${basePath}/`)) {
		return ensureLeadingSlash(path.slice(basePath.length));
	}

	return ensureLeadingSlash(path);
}

export function withBase(path: string) {
	if (isAbsoluteUrl(path) || path.startsWith('#')) {
		return path;
	}

	return `${basePath}${ensureLeadingSlash(path)}`;
}

export function assetWithBase(path: string) {
	if (isAbsoluteUrl(path) || path.startsWith('#')) {
		return path;
	}

	const normalizedPath = ensureLeadingSlash(path);

	if (!basePath || normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`)) {
		return normalizedPath;
	}

	return `${basePath}${normalizedPath}`;
}

export function absoluteWithBase(path: string) {
	return new URL(withBase(path), siteOrigin).toString();
}

export function absoluteAssetWithBase(path: string) {
	return new URL(assetWithBase(path), siteOrigin).toString();
}
