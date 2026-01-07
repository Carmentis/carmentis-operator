import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { OrganisationEntity } from '../../../../../shared/entities/OrganisationEntity';
import { OrganisationService } from '../../../../../shared/services/OrganisationService';
import { Logger } from '@nestjs/common';
import { CurrentUser } from '../../../../decorators/CurrentUserDecorator';
import { UserEntity } from '../../../../../shared/entities/UserEntity';
import { JwtProtectedResolver } from '../JwtProtectedResolver';


@Resolver(of => OrganisationEntity)
export class UnrestrictedOrganisationResolver extends JwtProtectedResolver {
	private logger = new Logger(UnrestrictedOrganisationResolver.name);
	constructor(
		private readonly organisationService: OrganisationService,
	) { super() }

	@Query(returns => [OrganisationEntity])
	async organisations( @CurrentUser() user: UserEntity ): Promise<OrganisationEntity[]> {
		return this.organisationService.findOrganisationsByUser(user);
	}


	@Mutation(returns => OrganisationEntity)
	async createOrganisation(
		@CurrentUser() user: UserEntity,
		@Args('name') name: string,
		@Args('encodedWalletSeed', { nullable: true }) encodedWalletSeed?: string,
	) {
		return this.organisationService.createByName(user, name, encodedWalletSeed)
	}

}




