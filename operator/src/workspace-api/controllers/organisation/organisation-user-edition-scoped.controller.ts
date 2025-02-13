import {
	Body,
	Controller,
	Delete, ForbiddenException,
	HttpException,
	HttpStatus,
	Logger,
	Param,
	Post,
	Put, Req,
	UseGuards,
} from '@nestjs/common';
import { UserInOrganisationGuard } from '../../guards/user-in-organisation.guard';
import { CanEditOracles, CanEditUsers } from '../../guards/user-has-valid-access-right.guard';
import { OrganisationService } from '../../../shared/services/organisation.service';
import { UserService } from '../../../shared/services/user.service';
import { ApplicationService } from '../../../shared/services/application.service';
import { AuditService } from '../../../shared/services/audit.service';
import { OracleService } from '../../../shared/services/oracle.service';
import { UpdateAccessRightDto } from '../../dto/update-access-rights.dto';
import { OrganisationAccessRightEntity } from '../../../shared/entities/organisation-access-right.entity';
import { AuditOperation, EntityType } from '../../../shared/entities/audit-log.entity';

@UseGuards(UserInOrganisationGuard, CanEditUsers)
@Controller('/workspace/api/organisation')
export class OrganisationUserEditionScopedController {
	logger = new Logger(OrganisationUserEditionScopedController.name);
	constructor(
		private readonly organisationService: OrganisationService,
		private readonly userService: UserService,
		private readonly applicationService: ApplicationService,
		private readonly auditService: AuditService,
		private readonly oracleService: OracleService,
	) {
	}

	@Put(":organisationId/user/:userPublicKey/rights")
	async updateAccessRights(
		@Param('organisationId') organisationId: number,
		@Param('userPublicKey') userPublicKey: string,
		@Body() rights: UpdateAccessRightDto,
	) {
		this.logger.log(`Updating rights for organisation ${organisationId} and user ${userPublicKey}`, JSON.stringify(rights))
		return this.organisationService.updateAccessRights(organisationId, userPublicKey, rights);
	}


	@Post(':organisationId/user')
	async addExistingUserInOrganisation(
		@Param('organisationId') organisationId: number,
		@Body('userPublicKey') userPublicKey: string,
	): Promise<OrganisationAccessRightEntity> {
		console.log(`Adding user ${userPublicKey} to ${organisationId}`);
		// obtain the organisation and user (abort if one not found)
		const organisation = await this.organisationService.findOne(organisationId);
		const user = await this.userService.findOneByPublicKey(userPublicKey);
		if ( !organisation || !user ) throw new HttpException('Organisation or user not found', HttpStatus.NOT_FOUND);

		// check that the user do not exist yet in the organisation
		const existingAccessRights = await this.organisationService.findAccessRightsByOrganisationId(organisationId);
		const existingUserPublicKeys = existingAccessRights
			.filter( a => a.user.publicKey === userPublicKey );
		if ( existingUserPublicKeys.length !== 0 ) throw new HttpException('User already exists', HttpStatus.CONFLICT);

		// add the user in organisation
		const accessRight = new OrganisationAccessRightEntity();
		accessRight.organisation = organisation;
		accessRight.user = user;

		// log the user access right creation
		this.auditService.log(
			EntityType.USER,
			organisationId,
			AuditOperation.ORGANISATION_USER_INSERTION,
			{ name: `${user.firstname} ${user.lastname}`, publicKey: userPublicKey },
		)

		// save the access right
		return await this.organisationService.createAccessRight(accessRight);
	}


	@Delete(':organisationId/user')
	async removeUserFromOrganisation(
		@Req() request: Request,
		@Param('organisationId') organisationId: number,
		@Body('userPublicKey') userPublicKey: string,
	) {
		// we reject the deletion if the user is the only one in the organisation
		const numberOfUsers = await this.organisationService.getNumberOfUsersInOrganisation(organisationId);
        if (numberOfUsers === 1) {
            throw new ForbiddenException('Cannot remove the only user in the organisation');
        }

		// we reject the deletion if the user is an administrator and is the only one administrator
		const authUser = await this.userService.findCurrentlyConnectedUser(request);
		const isAdmin = await this.organisationService.findAccessRightsOfUserInOrganisation(authUser, organisationId);
		const adminNumbers = await this.organisationService.countAdminInOrganisations(organisationId);
		if (isAdmin && adminNumbers == 1) {
            throw new ForbiddenException('Cannot remove the only administrator in the organisation');
        }

		const user = this.organisationService.removeUserFromOrganisation( organisationId, userPublicKey );
		if ( user ) {
			this.auditService.log(
				EntityType.USER,
				organisationId,
				AuditOperation.ORGANISATION_USER_INSERTION,
				{ publicKey: userPublicKey },
			)
		}
	}

}