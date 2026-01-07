import { JwtProtectedResolver } from '../JwtProtectedResolver';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenException, Logger, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { OrganizationMemberRestrictedOrganizationGuard } from '../../../../guards/OrganizationMemberRestrictedOrganizationGuard';
import { OrganisationEntity } from '../../../../../shared/entities/OrganisationEntity';
import { CurrentUser } from '../../../../decorators/CurrentUserDecorator';
import { UserEntity } from '../../../../../shared/entities/UserEntity';
import { OrganisationService } from '../../../../../shared/services/OrganisationService';
import { OrganisationByIdPipe } from '../../../../pipes/OrganisationByIdPipe';
import { OrganisationUpdateDto } from '../../../dto/OrganisationUpdateDto';
import { ResourceId } from '../../../../decorators/ResourceId';
import { ApplicationType } from '../../../types/ApplicationType';
import { mapper } from '../../../mapper';
import { ApplicationEntity } from '../../../../../shared/entities/ApplicationEntity';
import { ApplicationService } from '../../../../../shared/services/ApplicationService';
import { OrganisationStatsDto } from '../../../dto/OrganisationStatsDto';
import { NodeEntity } from '../../../../../shared/entities/NodeEntity';
import { NodeService } from '../../../../../shared/services/NodeService';
import { RevealedApiKeyType } from '../../../types/RevealedApiKeyType';
import { ApplicationByIdPipe } from '../../../../pipes/ApplicationByIdPipe';
import { ApiKeyType } from '../../../types/ApiKeyType';
import { ApiKeyService } from '../../../../../shared/services/ApiKeyService';
import { ApiKeyEntity } from '../../../../../shared/entities/ApiKeyEntity';

@Resolver(of => OrganisationEntity)
@UseGuards(OrganizationMemberRestrictedOrganizationGuard)
export class OrganizationMemberRestrictedOrganizationResolver extends JwtProtectedResolver {
	private logger = new Logger(OrganizationMemberRestrictedOrganizationResolver.name);
	constructor(
		private readonly organisationService: OrganisationService,
		private readonly applicationService: ApplicationService,
		private readonly nodeService: NodeService,
		private readonly apiKeyService: ApiKeyService,
	) { super() }



	@Query(returns => OrganisationEntity)
	@ResourceId('id')
	async organisation(
		@Args('id', { type: () => Int }) id: number
	): Promise<OrganisationEntity | null> {
		return this.organisationService.findOne(id);
	}

	@Query(returns => [ApiKeyType])
	async getAllApiKeysOfOrganisation(
		@Args('organisationId', { type: () => Int }) organisationId: number
	): Promise<ApiKeyType[]> {
		const keys = await this.apiKeyService.findAllKeysByOrganisation(organisationId);
		return mapper.mapArray(keys, ApiKeyEntity, ApiKeyType)
	}


	@Query(() => [ApplicationType], { name: 'getAllApplicationsInOrganisation' })
	async getAllApplicationsInOrganisation(
		@Args('organisationId', { type: () => Int }) organisationId: number,
	): Promise<ApplicationType[]> {
		const applications = await this.applicationService.findAllApplicationsInOrganisationByOrganisationId(organisationId);
		return mapper.mapArray(applications, ApplicationEntity, ApplicationType);
	}

	@Query(returns => OrganisationStatsDto)
	@ResourceId('id')
	async getOrganisationStatistics(
		@Args('id', { type: () => Int }) id: number
	): Promise<OrganisationStatsDto> {
		const [numberOfApplications, numberOfUsers] = await Promise.all([
			this.organisationService.getNumberOfApplicationsInOrganisation(id),
			this.organisationService.getNumberOfUsersInOrganisation(id),
		]);
		return {
			numberOfApplications,
			numberOfUsers,
		};
	}

	@Mutation(() => ApplicationType, { name: 'createApplicationInOrganisation' })
	async createApplicationInOrganisation(
		@Args('organisationId', { type: () => Int }, OrganisationByIdPipe) organisation: OrganisationEntity,
		@Args('applicationName', { type: () => String }) applicationName: string,
	) {
		return await this.applicationService.createApplicationInOrganisationByName(
			organisation,
			applicationName,
		);
	}



	@Mutation(returns => OrganisationEntity)
	@ResourceId('organisationId')
	async updateOrganisation(
		@CurrentUser() user: UserEntity,
		@Args('organisationId', { type: () => Int }, OrganisationByIdPipe) organisation: OrganisationEntity,
		@Args('organisation', {type: () => OrganisationUpdateDto})
		organisationDto: OrganisationUpdateDto,
	): Promise<OrganisationEntity> {
		const {countryCode, name, city, website} = organisationDto;
		return this.organisationService.updateOrganisation(organisation, {
			name,
			countryCode,
			website,
			city,
		});
	}

	@Mutation(returns => Boolean)
	@ResourceId('id')
	async forceChainSync(
		@Args('id', { type: () => Int }) id: number,
	) {
		try {
			const organisation = await this.organisationService.findOne(id);
			await this.organisationService.synchronizeOrganizationWithApplicationsAndNodesFromChain(organisation);
			return true;
		} catch (e) {
			this.logger.error("Cannot sync:", e);
			return false;
		}
	}


	@Mutation(returns => Boolean)
	@ResourceId('id')
	async publishOrganisation(
		@Args('id', { type: () => Int }) id: number
	) {
		const organisation = await this.organisationService.findOne(id);
		if (!organisation) {
			throw new NotFoundException('Organisation not found');
		}
		await this.organisationService.publishOrganisation(id);
		return true
	}


	@Mutation(returns => OrganisationEntity)
	@ResourceId('id')
	async deleteOrganisation(
		@CurrentUser() user: UserEntity,
		@Args('id', { type: () => Int }) id: number
	): Promise<void> {
		const organisation = await this.organisationService.findOne(id);
		if (!organisation) {
			throw new NotFoundException('Organisation not found');
		}
		await this.organisationService.deleteOrganisationById(id);
	}


	@Mutation(() => Boolean, { name: 'addUserInOrganisation' })
	async addUserInOrganisation(
		@Args('organisationId', { type: () => Int }) organisationId: number,
		@Args('userPublicKey') userPublicKey: string,
	) {
		await this.organisationService.addUserInOrganisation(organisationId, userPublicKey);
		return true;
	}

	@Mutation(() => Boolean, { name: 'importNodeInOrganisation' })
	async importNodeInOrganisation(
		@Args('organisationId', { type: () => Int }) organisationId: number,
		@Args('nodeAlias') nodeAlias: string,
		@Args('nodeRpcEndpoint') nodeRpcEndpoint: string,
	) {
		await this.organisationService.importNodeInOrganisation(organisationId, nodeAlias, nodeRpcEndpoint);
		return true;
	}

	@Mutation(() => Boolean, { name: 'removeUserFromOrganisation' })
	async removeUserFromOrganisation(
		@Args('organisationId', { type: () => Int }) organisationId: number,
		@Args('userPublicKey') userPublicKey: string,
	) {
		try {
			await this.organisationService.removeUserFromOrganisation(organisationId, userPublicKey);
			return true;
		} catch (error) {
			this.logger.error(error);
			return false;
		}
	}

	@Mutation(() => Boolean, { name: 'changeOrganisationKeyPair' })
	async changeOrganisationKeyPair(
		@Args('organisationId', { type: () => Int }, OrganisationByIdPipe) organisation: OrganisationEntity,
		@Args('privateKey') privateKey: string,
	) {
		return false;
	}


	@Mutation(() => Boolean, { name: 'deleteNodeInOrganisation' })
	async deleteNodeInOrganisation(
		@CurrentUser() user: UserEntity,
		@Args('organisationId', { type: () => Int }, OrganisationByIdPipe) organisation: OrganisationEntity,
		@Args('nodeId', { type: () => Int }) nodeId: number,
	){
		// checks that the user belongs to the organisation
		const userBelongsToOrganisation = await this.organisationService.checkUserBelongsToOrganisation(user, organisation);
		if (!userBelongsToOrganisation) {
			throw new UnauthorizedException('User does not belong to the organisation');
		}

		await this.nodeService.deleteNode(
			organisation,
			nodeId
		);

		return true;
	}

	@Mutation(() => NodeEntity, { name: 'updateNodeInOrganisation' })
	async updateNodeInOrganisation(
		@CurrentUser() user: UserEntity,
		@Args('organisationId', { type: () => Int }, OrganisationByIdPipe) organisation: OrganisationEntity,
		@Args('nodeId', { type: () => Int }) nodeId: number,
		@Args('nodeAlias', { type: () => String }) nodeAlias: string,
		@Args('nodeRpcEndpoint', { type: () => String }) nodeRpcEndpoint: string,
	): Promise<NodeEntity> {
		const userBelongsToOrganisation = await this.organisationService.checkUserBelongsToOrganisation(user, organisation);
		if (!userBelongsToOrganisation) {
			throw new UnauthorizedException('User does not belong to the organisation');
		}

		return this.nodeService.updateNode(
			organisation,
			nodeId,
			nodeAlias,
			nodeRpcEndpoint
		);
	}
	@Mutation(() => NodeEntity, { name: 'claimNodeInOrganisation' })
	async claimNodeInOrganisation(
		@CurrentUser() user: UserEntity,
		@Args('organisationId', { type: () => Int }, OrganisationByIdPipe) organisation: OrganisationEntity,
		@Args('nodeId', { type: () => Int }) nodeId: number,
	): Promise<NodeEntity> {
		const userBelongsToOrganisation = await this.organisationService.checkUserBelongsToOrganisation(user, organisation);
		if (!userBelongsToOrganisation) {
			throw new UnauthorizedException('User does not belong to the organisation');
		}

		return this.nodeService.claimNodeById(
			organisation,
			nodeId
		);
	}

	@Mutation(() => NodeEntity, { name: 'stakeNodeInOrganisation' })
	async stakeNodeInOrganisation(
		@CurrentUser() user: UserEntity,
		@Args('organisationId', { type: () => Int }, OrganisationByIdPipe) organisation: OrganisationEntity,
		@Args('nodeId', { type: () => Int }) nodeId: number,
		@Args('amount', { type: () => String }) amount: string,
	): Promise<NodeEntity> {
		const userBelongsToOrganisation = await this.organisationService.checkUserBelongsToOrganisation(user, organisation);
		if (!userBelongsToOrganisation) {
			throw new UnauthorizedException('User does not belong to the organisation');
		}

		return this.nodeService.stakeNodeById(
			organisation,
			nodeId,
			amount
		);
	}


}