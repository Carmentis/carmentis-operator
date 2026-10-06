import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { isAdminUiPath } from '../utils/AdminPaths';

/**
 * Defence in depth against cross-site form submissions on the admin UI.
 *
 * The admin session cookie is `SameSite=Lax`, which already keeps browsers from sending it on
 * cross-site POSTs; this guard additionally rejects state-changing admin requests whose
 * `Origin` (or, failing that, `Referer`) does not match the host being served. Requests that
 * carry neither header (non-browser clients) are left to the authentication guard.
 */
@Injectable()
export class SameOriginGuard implements CanActivate {
	private static readonly SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>();
		if (!request || SameOriginGuard.SAFE_METHODS.has(request.method)) return true;
		if (!isAdminUiPath(request.path)) return true;

		const source = request.headers.origin ?? request.headers.referer;
		if (!source) return true;

		let sourceHost: string;
		try {
			sourceHost = new URL(source).host;
		} catch {
			throw new ForbiddenException('Invalid request origin');
		}
		const servedHosts = [request.headers.host, request.headers['x-forwarded-host']]
			.flat()
			.filter(Boolean);
		if (!servedHosts.includes(sourceHost)) {
			throw new ForbiddenException('Cross-origin request refused');
		}
		return true;
	}
}
