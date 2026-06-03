const baseUrl = import.meta.env.BASE_URL || '/';

const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

export function withBase(path = '') {
	const normalizedPath = path.replace(/^\/+/, '');
	return `${normalizedBaseUrl}${normalizedPath}`;
}

export function withoutBase(pathname: string) {
	const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
	const basePath = normalizedBaseUrl.replace(/\/$/, '');

	if (!basePath) {
		return normalizedPathname;
	}

	if (normalizedPathname === basePath) {
		return '/';
	}

	if (normalizedPathname.startsWith(`${basePath}/`)) {
		return normalizedPathname.slice(basePath.length) || '/';
	}

	return normalizedPathname;
}
