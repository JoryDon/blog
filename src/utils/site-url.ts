const EXTERNAL_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;
const SPECIAL_URL_PATTERN = /^(?:#|mailto:|tel:)/i;

const rawBase = import.meta.env.BASE_URL || '/';
const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
const baseWithoutTrailingSlash = normalizedBase.endsWith('/')
	? normalizedBase.slice(0, -1)
	: normalizedBase;
const hasDeploymentBase = normalizedBase !== '/';

function shouldLeaveUnchanged(path: string) {
	return EXTERNAL_URL_PATTERN.test(path) || SPECIAL_URL_PATTERN.test(path);
}

function splitSuffix(path: string) {
	const suffixStart = path.search(/[?#]/);
	if (suffixStart === -1) {
		return { pathname: path, suffix: '' };
	}

	return {
		pathname: path.slice(0, suffixStart),
		suffix: path.slice(suffixStart),
	};
}

function ensureLeadingSlash(path: string) {
	return path.startsWith('/') ? path : `/${path}`;
}

export function withBase(path: string) {
	if (!path || shouldLeaveUnchanged(path)) {
		return path;
	}

	const { pathname, suffix } = splitSuffix(path);

	if (!hasDeploymentBase) {
		return `${ensureLeadingSlash(pathname || '/')}${suffix}`;
	}

	const pathWithoutLeadingSlash = pathname.replace(/^\/+/, '');
	const basePath = pathWithoutLeadingSlash ? `${normalizedBase}${pathWithoutLeadingSlash}` : normalizedBase;
	return `${basePath}${suffix}`;
}

export function assetWithBase(path: string) {
	if (!path || shouldLeaveUnchanged(path)) {
		return path;
	}

	const { pathname, suffix } = splitSuffix(path);
	const pathWithLeadingSlash = ensureLeadingSlash(pathname || '/');

	if (
		hasDeploymentBase &&
		(pathWithLeadingSlash === baseWithoutTrailingSlash || pathWithLeadingSlash.startsWith(normalizedBase))
	) {
		return `${pathWithLeadingSlash}${suffix}`;
	}

	return withBase(`${pathname}${suffix}`);
}

export function withoutBase(path: string) {
	const pathWithLeadingSlash = ensureLeadingSlash(path || '/');

	if (!hasDeploymentBase) {
		return pathWithLeadingSlash;
	}

	if (pathWithLeadingSlash === baseWithoutTrailingSlash) {
		return '/';
	}

	if (pathWithLeadingSlash.startsWith(normalizedBase)) {
		return ensureLeadingSlash(pathWithLeadingSlash.slice(normalizedBase.length));
	}

	return pathWithLeadingSlash;
}

export function pageWithBase(path: string) {
	return withBase(withoutBase(path));
}

export function absolutePageUrl(path: string, site: string | URL) {
	return new URL(pageWithBase(path), site).toString();
}

export function absoluteAssetUrl(path: string, site: string | URL) {
	return new URL(assetWithBase(path), site).toString();
}
