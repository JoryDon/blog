const base = import.meta.env.BASE_URL || '/';

export function withBase(path = '/'): string {
	const baseUrl = base.endsWith('/') ? base : `${base}/`;
	const cleanPath = path.replace(/^\/+/, '');

	return `${baseUrl}${cleanPath}`.replace(/\/{2,}/g, '/');
}
