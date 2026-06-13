const protocolPattern = /^[a-z][a-z\d+\-.]*:/i;

export function withBase(path: string) {
	if (!path || path.startsWith('#') || path.startsWith('//') || protocolPattern.test(path)) {
		return path;
	}

	const base = import.meta.env.BASE_URL;
	if (base === '/') {
		return path.startsWith('/') ? path : `/${path}`;
	}

	const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	return normalizedPath === '/' ? `${normalizedBase}/` : `${normalizedBase}${normalizedPath}`;
}
