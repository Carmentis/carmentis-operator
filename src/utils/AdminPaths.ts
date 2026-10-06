export const ADMIN_UI_PREFIX = '/admin';

export function isAdminUiPath(path: string): boolean {
	return path === ADMIN_UI_PREFIX || path.startsWith(`${ADMIN_UI_PREFIX}/`);
}
