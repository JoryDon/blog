export function withBase(path = '') {
	const base = import.meta.env.BASE_URL.endsWith('/')
		? import.meta.env.BASE_URL
		: `${import.meta.env.BASE_URL}/`;
	const normalizedPath = path.replace(/^\/+/, '');

	return `${base}${normalizedPath}`;
}

export function absoluteUrl(path: string, site: URL | string | undefined) {
	if (!site) {
		throw new Error('Astro site URL is required to build absolute URLs.');
	}

	return new URL(withBase(path), site);
}
