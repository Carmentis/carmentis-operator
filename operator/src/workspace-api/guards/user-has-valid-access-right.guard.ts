import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { OrganisationAccessRightEntity } from '../entities/organisation-access-right.entity';
import { OrganisationService } from '../services/organisation.service';

@Injectable()
export abstract class UserHasValidAccessRightGuard implements CanActivate{
	constructor(
		private userService: UserService,
		private organisationServer: OrganisationService
	) {}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		const user = await this.userService.findCurrentlyConnectedUser(request);
		const organisationId = request.params.organisationId;
		const organisation = await this.organisationServer.findOne(organisationId);
		if (!organisation) throw new UnauthorizedException()
		const accessRight = await this.organisationServer.findAccessRightsOfUserInOrganisation(user, organisation);
		if (!accessRight) throw new UnauthorizedException()
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