export function withBase(path: string): string {
	const normalizedBase = import.meta.env.BASE_URL.replace(/\/$/, '');
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	return `${normalizedBase}${normalizedPath}` || '/';
}
