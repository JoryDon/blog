const externalUrlPattern = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;

const normalizedBase = (() => {
	const base = import.meta.env.BASE_URL || '/';
	if (base === '/') {
		return '';
	}

	return `/${base.replace(/^\/+|\/+$/g, '')}`;
})();

const siteOrigin = (import.meta.env.SITE || 'https://jinruihub.github.io').replace(/\/+$/, '');

function isExternalUrl(path: string) {
	return externalUrlPattern.test(path) || path.startsWith('mailto:') || path.startsWith('tel:');
}

function normalizePath(path: string) {
	if (path === '') {
		return '/';
	}

	return path.startsWith('/') ? path : `/${path}`;
}

export function withBase(path: string) {
	if (isExternalUrl(path) || path.startsWith('#')) {
		return path;
	}

	const normalizedPath = normalizePath(path);
	if (!normalizedBase) {
		return normalizedPath;
	}

	return `${normalizedBase}${normalizedPath}`;
}

export function assetWithBase(path: string) {
	return withBase(path);
}

export function withoutBase(path: string) {
	if (isExternalUrl(path) || path.startsWith('#') || !normalizedBase) {
		return path;
	}

	const normalizedPath = normalizePath(path);
	if (normalizedPath === normalizedBase || normalizedPath === `${normalizedBase}/`) {
		return '/';
	}

	if (normalizedPath.startsWith(`${normalizedBase}/`)) {
		return normalizedPath.slice(normalizedBase.length) || '/';
	}

	return normalizedPath;
}

export function absoluteWithBase(path: string) {
	if (isExternalUrl(path)) {
		return path;
	}

	return new URL(withBase(path), `${siteOrigin}/`).toString();
}
