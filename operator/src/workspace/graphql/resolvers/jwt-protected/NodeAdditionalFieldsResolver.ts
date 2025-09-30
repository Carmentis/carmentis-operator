import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../../guards/GraphQLJwtAuthGuard';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import ChainService from '../../../../shared/services/ChainService';
import { NodeEntity } from '../../../../shared/entities/NodeEntity';
import { ApplicationType } from '../../types/ApplicationType';
import { CurrentUser } from '../../../decorators/CurrentUserDecorator';
import { UserEntity } from '../../../../shared/entities/UserEntity';
import { OrganisationByIdPipe } from '../../../pipes/OrganisationByIdPipe';
import { OrganisationEntity } from '../../../../shared/entities/OrganisationEntity';
import { OrganisationService } from '../../../../shared/services/OrganisationService';
import { NodeService } from '../../../../shared/services/NodeService';
import { OrganisationChainStatusType } from '../../types/OrganisationChainStatusType';
import { JwtProtectedResolver } from './JwtProtectedResolver';


@Resolver(of => NodeEntity)
export class NodeAdditionalFieldsResolver extends JwtProtectedResolver {

	@ResolveField(() => Boolean, { name: 'isClaimable' })
	async isClaimable(@Parent() node: NodeEntity): Promise<boolean> {
		return node.virtualBlockchainId === undefined;
	}

}