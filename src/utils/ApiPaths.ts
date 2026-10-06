/**
 * Removes the version segment of a public API path (`/api/v1/anchorRequest` -> `/api/anchorRequest`).
 *
 * The endpoint restrictions configured on API keys (`^/api/anchor.*`) predate API versioning
 * and are written without a version; matching them against the stripped path keeps them
 * working for versioned and unversioned URLs alike, and across future versions.
 */
export function stripApiVersion(path: string): string {
	return path.replace(/^\/api\/v\d+(?=\/|$)/, '/api');
}
