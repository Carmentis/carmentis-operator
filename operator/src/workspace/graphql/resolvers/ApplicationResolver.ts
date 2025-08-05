import { BadRequestException, ForbiddenException, Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../guards/GraphQLJwtAuthGuard';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ApplicationType } from '../types/ApplicationType';
import { OrganisationService } from '../../../shared/services/OrganisationService';
import { ApplicationService } from '../../../shared/services/ApplicationService';
import { mapper } from '../mapper';
import { ApplicationEntity } from '../../../shared/entities/ApplicationEntity';
import { CurrentUser } from '../../decorators/CurrentUserDecorator';
import { UserEntity } from '../../../shared/entities/UserEntity';
import { OrganisationByIdPipe } from '../../pipes/OrganisationByIdPipe';
import { OrganisationEntity } from '../../../shared/entities/OrganisationEntity';
import { ApplicationByIdPipe } from '../../pipes/ApplicationByIdPipe';
import { ApplicationUpdateDto } from '../dto/ApplicationCreationDto';

@UseGuards(GraphQLJwtAuthGuard)
@Resolver(of => ApplicationType)
export class ApplicationResolver {
	private logger = new Logger(ApplicationResolver.name);

	constructor(
		private readonly organisationService: OrganisationService,
		private readonly applicationService: ApplicationService,
	) {
	}

	@Query(() => [ApplicationType], { name: 'getAllApplicationsInOrganisation' })
	async getAllApplicationsInOrganisation(
		@Args('organisationId', { type: () => Int }) organisationId: number,
	): Promise<ApplicationType[]> {
		const applications = await this.applicationService.findAllApplicationsInOrganisationByOrganisationId(organisationId);
		return mapper.mapArray(applications, ApplicationEntity, ApplicationType);
	}

	@Query(() => [ApplicationType], { name: 'getAllApplications' })
	async getAllApplications(): Promise<ApplicationType[]> {
		const applications = await this.applicationService.findAllApplications();
		return mapper.mapArray(applications, ApplicationEntity, ApplicationType);
	}

	@ResolveField(() => Int, { name: 'organisationId' })
	async getOrganisationId(@Parent() application: ApplicationEntity): Promise<number> {
		const organisation = await this.organisationService.findOrganisationByApplication(application);
		return organisation.id;
	}

	@Mutation(() => ApplicationType, { name: 'createApplicationInOrganisation' })
	async createApplicationInOrganisation(
		@CurrentUser() user: UserEntity,
		@Args('organisationId', { type: () => Int }, OrganisationByIdPipe) organisation: OrganisationEntity,
		@Args('applicationName', { type: () => String }) applicationName: string,
	) {
		// checks that the user belongs to the organisation
		const userBelongsToOrganisation = await this.organisationService.checkUserBelongsToOrganisation(user, organisation);
		if (!userBelongsToOrganisation) {
			throw new UnauthorizedException('User does not belong to the organisation');
		}

		return await this.applicationService.createApplicationInOrganisationByName(
			organisation,
			applicationName,
		);
	}

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