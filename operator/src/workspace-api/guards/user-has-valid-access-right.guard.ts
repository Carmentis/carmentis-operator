import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../shared/services/user.service';
import { OrganisationAccessRightEntity } from '../../shared/entities/organisation-access-right.entity';
import { OrganisationService } from '../../shared/services/organisation.service';

@Injectable()
export abstract class UserHasValidAccessRightGuard implements CanActivate{
	constructor(
		private userService: UserService,
		private organisationServer: OrganisationService
	) {}


	/**
	 * Determines whether the current user has access to the requested resource in a given organization.
	 * This method checks the following conditions:
	 * - Verifies if the organization exists.
	 * - Checks if the user has access rights to the organization.
	 * - Grants access if the user is an admin or has specific access rights.
	 *
	 * @param {ExecutionContext} context - The execution context containing the HTTP request and related metadata.
	 * @return {Promise<boolean>} A promise that resolves to true if the user is authorized to access the resource, otherwise false.
	 * @throws {UnauthorizedException} If the organization does not exist or the user lacks access rights.
	 */
	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		const user = await this.userService.findCurrentlyConnectedUser(request);
		const organisationId = request.params.organisationId;
		const organisation = await this.organisationServer.findOne(organisationId);
		if (!organisation) throw new NotFoundException("The requested organisation do not exist.")

		// if the user is admin, allow the transaction
		if (user.isAdmin) return true;

		// search if the user is allowed within the organisation
		const accessRight = await this.organisationServer.findAccessRightsOfUserInOrganisation(user, organisation);
		if (!accessRight) throw new UnauthorizedException("You are not in the organisation.")
		return this.hasAccess(accessRight);
	}

	abstract hasAccess(accessRight: OrganisationAccessRightEntity) : boolean;
}

@Injectable()
export class CanEditApplications extends UserHasValidAccessRightGuard {
	hasAccess(accessRight: OrganisationAccessRightEntity) {
		return accessRight.isAdmin || accessRight.editApplications;
	}
}

@Injectable()
export class CanEditUsers extends UserHasValidAccessRightGuard {
	hasAccess(accessRight: OrganisationAccessRightEntity) {
		return accessRight.isAdmin || accessRight.editUsers;
	}
}

@Injectable()
export class CanEditOracles extends UserHasValidAccessRightGuard {
	hasAccess(accessRight: OrganisationAccessRightEntity) {
		return accessRight.isAdmin || accessRight.editOracles;
	}
}

@Injectable()
export class IsAdminInOrganisation extends UserHasValidAccessRightGuard {
	hasAccess(accessRight: OrganisationAccessRightEntity) {
		return accessRight.isAdmin;
	}
}