const externalProtocolPattern = /^[a-z][a-z\d+\-.]*:/i;

export function withBase(path: string): string {
	if (externalProtocolPattern.test(path) || path.startsWith('//')) {
		return path;
	}

	const base = import.meta.env.BASE_URL || '/';
	const normalizedBase = base.endsWith('/') ? base : `${base}/`;
	const normalizedPath = path.replace(/^\/+/, '');

	return normalizedPath ? `${normalizedBase}${normalizedPath}` : normalizedBase;
}
