import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../shared/services/user.service';



/**
 * Guard that checks if the currently connected user is either an admin or a member of a specified organisation.
 *
 * This guard retrieves the currently connected user and the target organisation ID from the request.
 * It then verifies whether the user is either an admin or belongs to the organisation.
 * If neither condition is met, an UnauthorizedException is thrown.
 *
 * Can be used to protect routes that require user membership in a specific organisation.
 *
 * Dependencies:
 * - `UserService`: Used for retrieving the currently connected user and verifying user membership in the organisation.
 */
@Injectable()
export class UserInOrganisationGuard implements CanActivate {
	constructor(
		private userService: UserService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = await this.userService.findCurrentlyConnectedUser(request);
		const organisationId = request.params.organisationId;
		const userInOrganisation = await this.userService.findUserInOrganisation(user.publicKey, organisationId);
		console.log(`user in organisation (${user.publicKey}):`, user.isAdmin, userInOrganisation)
        if (user.isAdmin || userInOrganisation) {
			return true;
        }
		throw new UnauthorizedException('User not in organisation');
	}
}