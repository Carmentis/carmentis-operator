import { BadRequestException, ForbiddenException, Logger, UseGuards } from '@nestjs/common';
import {
	OrganizationMemberRestrictedApplicationGuard
} from '../../../../guards/OrganizationMemberRestrictedApplicationGuard';
import { JwtProtectedResolver } from '../JwtProtectedResolver';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ApplicationType } from '../../../types/ApplicationType';
import { ApplicationByIdPipe } from '../../../../pipes/ApplicationByIdPipe';
import { ApplicationEntity } from '../../../../../shared/entities/ApplicationEntity';
import { mapper } from '../../../mapper';
import { ApplicationUpdateDto } from '../../../dto/ApplicationCreationDto';
import { OrganisationService } from '../../../../../shared/services/OrganisationService';
import { ApplicationService } from '../../../../../shared/services/ApplicationService';

/**
 * This resolver focus on operations being allowed only for users being
 * member of the organization owning the application.
 */
@UseGuards(OrganizationMemberRestrictedApplicationGuard)
@Resolver(of => ApplicationType)
export class OrganizationMemberRestrictedApplicationResolver extends JwtProtectedResolver {
	private logger = new Logger(OrganizationMemberRestrictedApplicationResolver.name);

	constructor(
		private readonly organisationService: OrganisationService,
		private readonly applicationService: ApplicationService,
	) { super() }


	@Query(() => ApplicationType, { name: 'getApplicationInOrganisation' })
	async getApplicationInOrganisation(
		@Args('applicationId', { type: () => Int }, ApplicationByIdPipe) application: ApplicationEntity,
	): Promise<ApplicationType> {
		return mapper.map(application, ApplicationEntity, ApplicationType);
	}

	@Mutation(returns => Boolean)
	async publishApplication(
		@Args('applicationId', { type: () => Int }, ApplicationByIdPipe) application: ApplicationEntity,
	) {
		const organisation = await this.organisationService.findOrganisationByApplication(application);
		// reject the publication of an application if the organisation is not published itself
		const organisationIsPublished = await this.organisationService.isPublished(organisation.id);
		if (!organisationIsPublished) throw new ForbiddenException('Publish first the organisation before to publish an application.');

		try {
			await this.applicationService.publishApplication(application.id);
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException(e);
		}

		return true;
	}


	@Mutation(() => Boolean, { name: 'deleteApplicationInOrganisation' })
	async deleteApplicationInOrganisation(
		@Args('applicationId', { type: () => Int }, ApplicationByIdPipe) application: ApplicationEntity,
	) {
		await this.applicationService.deleteApplicationById(application.id);
		return true;
	}

	@Mutation(() => ApplicationType, { name: 'updateApplicationInOrganisation' })
	async updateApplicationInOrganisation(
		@Args('applicationId', { type: () => Int }, ApplicationByIdPipe) application: ApplicationEntity,
		@Args('applicationUpdate') applicationUpdate: ApplicationUpdateDto,
	) {
		const updatedApplication = await this.applicationService.update(application, applicationUpdate);
		return mapper.map(updatedApplication, ApplicationEntity, ApplicationType);
	}

}