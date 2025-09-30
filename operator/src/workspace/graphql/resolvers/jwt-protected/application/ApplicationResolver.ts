import { BadRequestException, ForbiddenException, Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../../../guards/GraphQLJwtAuthGuard';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ApplicationType } from '../../../types/ApplicationType';
import { OrganisationService } from '../../../../../shared/services/OrganisationService';
import { ApplicationService } from '../../../../../shared/services/ApplicationService';
import { mapper } from '../../../mapper';
import { ApplicationEntity } from '../../../../../shared/entities/ApplicationEntity';
import { CurrentUser } from '../../../../decorators/CurrentUserDecorator';
import { UserEntity } from '../../../../../shared/entities/UserEntity';
import { OrganisationByIdPipe } from '../../../../pipes/OrganisationByIdPipe';
import { OrganisationEntity } from '../../../../../shared/entities/OrganisationEntity';
import { ApplicationByIdPipe } from '../../../../pipes/ApplicationByIdPipe';
import { ApplicationUpdateDto } from '../../../dto/ApplicationCreationDto';
import { JwtProtectedResolver } from '../JwtProtectedResolver';


@Resolver(of => ApplicationType)
export class ApplicationResolver extends JwtProtectedResolver {
	private logger = new Logger(ApplicationResolver.name);

	constructor(
		private readonly organisationService: OrganisationService,
		private readonly applicationService: ApplicationService,
	) { super() }



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




}