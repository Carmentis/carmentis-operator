import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../guards/GraphQLJwtAuthGuard';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import ChainService from '../../../shared/services/ChainService';
import { NodeEntity } from '../../../shared/entities/NodeEntity';
import { ApplicationType } from '../types/ApplicationType';
import { CurrentUser } from '../../decorators/CurrentUserDecorator';
import { UserEntity } from '../../../shared/entities/UserEntity';
import { OrganisationByIdPipe } from '../../pipes/OrganisationByIdPipe';
import { OrganisationEntity } from '../../../shared/entities/OrganisationEntity';
import { OrganisationService } from '../../../shared/services/OrganisationService';
import { NodeService } from '../../../shared/services/NodeService';

@UseGuards(GraphQLJwtAuthGuard)
@Resolver(of => NodeEntity)
export class NodeResolver {
	private logger = new Logger(NodeResolver.name);

	constructor(
		private readonly chainService: ChainService,
		private readonly organisationService: OrganisationService,
		private readonly nodeService: NodeService,
	) {}


	@Mutation(() => NodeEntity, { name: 'importNodeInOrganisation' })
	async importNodeInOrganisation(
		@CurrentUser() user: UserEntity,
		@Args('organisationId', { type: () => Int }, OrganisationByIdPipe) organisation: OrganisationEntity,
		@Args('nodeAlias', { type: () => String }) nodeAlias: string,
		@Args('nodeRpcEndpoint', { type: () => String }) nodeRpcEndpoint: string,
	) {
		// checks that the user belongs to the organisation
		const userBelongsToOrganisation = await this.organisationService.checkUserBelongsToOrganisation(user, organisation);
		if (!userBelongsToOrganisation) {
			throw new UnauthorizedException('User does not belong to the organisation');
		}

		return await this.nodeService.importNode(
			organisation,
			nodeAlias,
			nodeRpcEndpoint
		);
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

		return await this.nodeService.deleteNode(
			organisation,
			nodeId
		);
	}




}