const base = import.meta.env.BASE_URL ?? '/';

function trimSlashes(path: string) {
	return path.replace(/^\/+|\/+$/g, '');
}

function isExternalUrl(path: string) {
	return /^[a-z][a-z\d+\-.]*:/i.test(path) || path.startsWith('//');
}

export function withoutBase(path: string) {
	if (isExternalUrl(path)) {
		return path;
	}

	const normalizedBase = `/${trimSlashes(base)}`;
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	if (normalizedBase === '/') {
		return normalizedPath;
	}

	if (normalizedPath === normalizedBase) {
		return '/';
	}

	if (normalizedPath.startsWith(`${normalizedBase}/`)) {
		return normalizedPath.slice(normalizedBase.length) || '/';
	}

	return normalizedPath;
}

export function withBase(path: string) {
	if (isExternalUrl(path)) {
		return path;
	}

	const normalizedBase = trimSlashes(base);
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	if (!normalizedBase) {
		return normalizedPath;
	}

	return normalizedPath === '/'
		? `/${normalizedBase}/`
		: `/${normalizedBase}${normalizedPath}`;
}

export function assetWithBase(path: string) {
	return withBase(path);
}

export function absoluteWithBase(path: string) {
	return new URL(withBase(path), import.meta.env.SITE).toString();
}
