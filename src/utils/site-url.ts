const baseUrl = import.meta.env.BASE_URL || '/';

function normalizeBase(base: string) {
	if (base === '/') {
		return '/';
	}

	return `/${base.replace(/^\/|\/$/g, '')}/`;
}

const normalizedBase = normalizeBase(baseUrl);

export function withBase(path: string) {
	if (
		path.startsWith('#') ||
		path.startsWith('//') ||
		/^[a-z][a-z\d+.-]*:/i.test(path)
	) {
		return path;
	}

	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	if (normalizedPath === '/') {
		return normalizedBase;
	}

	const baseWithoutTrailingSlash = normalizedBase === '/' ? '' : normalizedBase.slice(0, -1);
	return `${baseWithoutTrailingSlash}${normalizedPath}`;
}
