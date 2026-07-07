const baseUrl = import.meta.env.BASE_URL || '/';

const hasProtocol = (path: string) => /^[a-z][a-z0-9+.-]*:\/\//i.test(path) || path.startsWith('//');

const normalizePath = (path: string) => {
	if (path === '') {
		return '/';
	}

	return path.startsWith('/') ? path : `/${path}`;
};

export function withBase(path = '/') {
	if (hasProtocol(path)) {
		return path;
	}

	const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
	const normalizedPath = normalizePath(path);

	if (!normalizedBase) {
		return normalizedPath;
	}

	if (normalizedPath === '/') {
		return `${normalizedBase}/`;
	}

	if (normalizedPath === normalizedBase || normalizedPath.startsWith(`${normalizedBase}/`)) {
		return normalizedPath;
	}

	return `${normalizedBase}${normalizedPath}`;
}

export function withoutBase(path = '/') {
	if (hasProtocol(path)) {
		const url = new URL(path);
		return `${url.pathname}${url.search}${url.hash}`;
	}

	const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
	const normalizedPath = normalizePath(path);

	if (!normalizedBase) {
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

export function absoluteWithBase(path: string, site: URL | string | undefined) {
	if (!site) {
		return withBase(path);
	}

	return new URL(withBase(path), site).toString();
}
