import { UseGuards } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../guards/GraphQLJwtAuthGuard';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { OrganisationStatsDto } from '../dto/OrganisationStatsDto';
import { OrganisationService } from '../../../shared/services/OrganisationService';

@UseGuards(GraphQLJwtAuthGuard)
@Resolver(of => OrganisationStatsDto)
export class OrganisationStatisticsResolver {

	constructor(
		private readonly organisationService: OrganisationService,
	) {
	}

	@Query(returns => OrganisationStatsDto)
	async getOrganisationStatistics(@Args('id', { type: () => Int }) id: number): Promise<OrganisationStatsDto> {
		const [numberOfApplications, numberOfUsers] = await Promise.all([
			this.organisationService.getNumberOfApplicationsInOrganisation(id),
			this.organisationService.getNumberOfUsersInOrganisation(id),
		]);
		return {
			numberOfApplications,
			numberOfUsers,
		};
	}
}