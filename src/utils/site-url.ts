const BASE_PATH = import.meta.env.BASE_URL;

function isExternalUrl(path: string) {
	return /^[a-z][a-z\d+.-]*:\/\//i.test(path) || path.startsWith('//');
}

export function withBase(path: string) {
	if (isExternalUrl(path)) {
		return path;
	}

	const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
	return new URL(normalizedPath, `https://example.com${BASE_PATH}`).pathname;
}

export function assetWithBase(path: string) {
	if (isExternalUrl(path) || BASE_PATH === '/' || path.startsWith(BASE_PATH)) {
		return path;
	}

	return withBase(path);
}

export function siteUrl(path: string, site: URL | string | undefined = import.meta.env.SITE) {
	if (!site) {
		throw new Error('Astro site must be configured to build absolute URLs.');
	}

	return new URL(withBase(path), site).href;
}

export function siteAssetUrl(path: string, site: URL | string | undefined = import.meta.env.SITE) {
	if (!site) {
		throw new Error('Astro site must be configured to build absolute asset URLs.');
	}

	return new URL(assetWithBase(path), site).href;
}
