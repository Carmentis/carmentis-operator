import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';


/**
 * Guard that checks if the currently connected user belongs to the specified organisation.
 *
 * This guard is responsible for intercepting incoming requests and verifying whether the
 * user making the request is associated with the organisation identified by the `organisationId`
 * parameter in the request. If the user is not found in the organisation, an `UnauthorizedException`
 * is thrown.
 *
 * The guard relies on `UserService` to retrieve the currently connected user and to check their
 * membership within the organisation.
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
        if (!userInOrganisation) {
            throw new UnauthorizedException('User not in organisation');
        }
		return true;
	}
}