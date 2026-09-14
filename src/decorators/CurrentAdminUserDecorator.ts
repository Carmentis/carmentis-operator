import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminJwtPayload } from '../services/AuthTokenService';

/**
 * Returns the JWT payload attached to the request by AuthGuard for authenticated
 * admin-session routes (see AuthGuard.canActivate: `request['user'] = payload`).
 */
export const CurrentAdminUser = createParamDecorator(
	(_, context: ExecutionContext): AdminJwtPayload => {
		const request = context.switchToHttp().getRequest();
		return request.user;
	},
);
