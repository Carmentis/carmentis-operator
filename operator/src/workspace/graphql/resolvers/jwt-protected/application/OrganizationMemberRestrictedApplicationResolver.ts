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
import { ApiKeyService } from '../../../../../shared/services/ApiKeyService';
import { RevealedApiKeyType } from '../../../types/RevealedApiKeyType';
import { ApiKeyEntity } from '../../../../../shared/entities/ApiKeyEntity';
import { ResourceId } from '../../../../decorators/ResourceId';
import { ApiKeyType } from '../../../types/ApiKeyType';
import { CurrentUser } from '../../../../decorators/CurrentUserDecorator';
import { UserEntity } from '../../../../../shared/entities/UserEntity';

/**
 * This resolver focus on operations being allowed only for users being
 * member of the organization owning the application.
 */

@Resolver(of => ApplicationType)
@UseGuards(OrganizationMemberRestrictedApplicationGuard)
@ResourceId('applicationId')
export class OrganizationMemberRestrictedApplicationResolver extends JwtProtectedResolver {
	private logger = new Logger(OrganizationMemberRestrictedApplicationResolver.name);

	constructor(
		private readonly organisationService: OrganisationService,
		private readonly applicationService: ApplicationService,
		private readonly apiKeyService: ApiKeyService,
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



	/**
	 * This function creates an api key and reveal it.
	 *
	 * Security note: The key is never revealed in another place.
	 */
	@Mutation(returns => RevealedApiKeyType, { name: 'createApiKey' })
	async createApiKey(
		@Args('applicationId', { type: () => Int }, ApplicationByIdPipe) application: ApplicationEntity,
		@Args('name') name: string,
		@Args('activeUntil') activeUntil: string,
	) {
		// parse the data
		const receivedActiveUntil = activeUntil;
		try {
			const activeUntil = new Date(Date.parse(receivedActiveUntil));
			const result = await this.apiKeyService.createKey(application, { name, activeUntil });
			const mappedKey: RevealedApiKeyType = mapper.map(result.keyEntity, ApiKeyEntity, RevealedApiKeyType);
			mappedKey.key = result.formattedKey;
			return mappedKey;
		} catch (e) {
			throw new BadRequestException(`Invalid date: ${e}`)
		}
	}


	@Query(returns => [ApiKeyType])
	async getAllApiKeysOfApplication(
		@CurrentUser() user: UserEntity,
		@Args('applicationId', { type: () => Int }, ApplicationByIdPipe) application: ApplicationEntity,
	) {
		const keys = await this.apiKeyService.findAllKeysByApplication(application);
		return mapper.mapArray(keys, ApiKeyEntity, ApiKeyType)
	}


}