const base = import.meta.env.BASE_URL ?? '/';
const basePath = base === '/' ? '' : base.replace(/\/$/, '');

function isPassthroughUrl(path: string) {
	return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path);
}

export function withBase(path: string) {
	if (isPassthroughUrl(path)) {
		return path;
	}

	if (path === '' || path === '/') {
		return basePath || '/';
	}

	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${basePath}${normalizedPath}`;
}

export function withoutBase(path: string) {
	if (!basePath) {
		return path;
	}

	if (path === basePath) {
		return '/';
	}

	if (path.startsWith(`${basePath}/`)) {
		return `/${path.slice(basePath.length + 1)}`;
	}

	return path;
}

export function absoluteWithBase(path: string, site: URL | string) {
	return new URL(withBase(path), site).toString();
}
