import { Response } from 'express';

/**
 * Name of the cookie holding the admin session JWT.
 * Read by {@link AuthGuard} as a fallback when no Authorization header is present.
 */
export const ADMIN_SESSION_COOKIE = 'admin_session';

function isSecureContext(): boolean {
	return process.env.NODE_ENV === 'production';
}

/**
 * Stores the admin session JWT in an httpOnly cookie so that server-rendered
 * admin pages authenticate without exposing the token to client-side scripts.
 *
 * @param res the express response to set the cookie on
 * @param token the signed JWT
 * @param validityInSeconds lifetime of the cookie, matching the JWT expiry
 */
export function setAdminSessionCookie(
	res: Response,
	token: string,
	validityInSeconds: number,
) {
	res.cookie(ADMIN_SESSION_COOKIE, token, {
		httpOnly: true,
		sameSite: 'lax',
		secure: isSecureContext(),
		maxAge: validityInSeconds * 1000,
		path: '/',
	});
}

export function clearAdminSessionCookie(res: Response) {
	res.clearCookie(ADMIN_SESSION_COOKIE, { path: '/' });
}
