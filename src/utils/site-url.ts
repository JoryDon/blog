const DEFAULT_SITE = 'http://localhost';

type Site = URL | string | undefined;

const basePath = import.meta.env.BASE_URL || '/';
const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
const baseWithoutTrailingSlash = normalizedBase.replace(/\/$/, '') || '/';

const hasScheme = (path: string) => /^[a-z][a-z\d+\-.]*:/i.test(path);

const shouldPassThrough = (path: string) =>
	hasScheme(path) || path.startsWith('//') || path.startsWith('#');

const ensureLeadingSlash = (path: string) => (path.startsWith('/') ? path : `/${path}`);

const siteOrDefault = (site: Site) => site ?? DEFAULT_SITE;

export const withBase = (path = '/') => {
	if (shouldPassThrough(path)) return path;

	const normalizedPath = ensureLeadingSlash(path);

	if (normalizedPath === '/') return normalizedBase;
	if (normalizedBase === '/') return normalizedPath;

	return `${baseWithoutTrailingSlash}${normalizedPath}`;
};

export const assetWithBase = (path = '/') => {
	if (shouldPassThrough(path)) return path;

	const normalizedPath = ensureLeadingSlash(path);

	if (normalizedBase === '/') return normalizedPath;
	if (normalizedPath === '/') return normalizedBase;
	if (normalizedPath === baseWithoutTrailingSlash || normalizedPath.startsWith(normalizedBase)) {
		return normalizedPath;
	}

	return `${baseWithoutTrailingSlash}${normalizedPath}`;
};

export const withoutBase = (path = '/') => {
	if (shouldPassThrough(path)) return path;

	const normalizedPath = ensureLeadingSlash(path);

	if (normalizedBase === '/') return normalizedPath;
	if (normalizedPath === baseWithoutTrailingSlash) return '/';
	if (normalizedPath.startsWith(normalizedBase)) {
		return ensureLeadingSlash(normalizedPath.slice(normalizedBase.length));
	}

	return normalizedPath;
};

export const absoluteWithBase = (path: string, site: Site) =>
	new URL(withBase(path), siteOrDefault(site)).toString();

export const absoluteAssetWithBase = (path: string, site: Site) =>
	new URL(assetWithBase(path), siteOrDefault(site)).toString();
