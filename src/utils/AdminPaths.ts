export const ADMIN_UI_PREFIX = '/admin';
export const ADMIN_API_PREFIX = '/admin/api/';

export function isAdminApiPath(path: string): boolean {
	return path.startsWith(ADMIN_API_PREFIX);
}

export function isAdminUiPath(path: string): boolean {
	return (
		(path === ADMIN_UI_PREFIX || path.startsWith(`${ADMIN_UI_PREFIX}/`)) &&
		!isAdminApiPath(path)
	);
}
