const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const isExternalUrl = (path: string) => /^[a-z][a-z\d+\-.]*:/i.test(path);

export function withBase(path = '/') {
	if (isExternalUrl(path) || path.startsWith('#')) {
		return path;
	}

	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	if (!base) {
		return normalizedPath;
	}

	return `${base}${normalizedPath}`.replace(/\/{2,}/g, '/');
}

export function assetWithBase(path: string) {
	return withBase(path);
}

export function withoutBase(path: string) {
	if (!base) {
		return path || '/';
	}

	if (path === base) {
		return '/';
	}

	if (path.startsWith(`${base}/`)) {
		return path.slice(base.length) || '/';
	}

	return path || '/';
}

export function absoluteWithBase(path = '/') {
	return new URL(withBase(path), import.meta.env.SITE).toString();
}
