import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { OrganisationEntity } from '../../entities/organisation.entity';
import { OrganisationService } from '../../services/organisation.service';
import {
	BadRequestException,
	ForbiddenException,
	Logger,
	NotFoundException,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../../workspace/guards/authentication.guards';
import { CurrentUser } from '../../../workspace/decorators/current-user.decorator';
import { UserEntity } from '../../entities/user.entity';
import ChainService from '../../services/chain.service';
import { OrganisationStatsDto } from '../dto/organisation/organisation-stats.dto';
import { ApplicationEntity } from '../../entities/application.entity';
import { ApplicationService } from '../../services/application.service';
import { ApplicationByIdPipe, OrganisationByIdPipe } from '../../../workspace/decorators/application.decorator';
import { ApplicationUpdateDto } from '../dto/application/application-creation.dto';
import { ApplicationType } from '../object-types/application.type';
import { mapper } from '../mapper';
import { TransactionType } from '../object-types/transaction.type';
import { CMTSToken, EncoderFactory, StringSignatureEncoder, TOKEN } from '@cmts-dev/carmentis-sdk/server';
import { OrganisationChainStatusType } from '../object-types/organisation-chain-status.type';

@UseGuards(GraphQLJwtAuthGuard)
@Resolver(of => OrganisationEntity)
export class OrganisationResolver {
	private logger = new Logger(OrganisationResolver.name);
	constructor(
		private readonly organisationService: OrganisationService,
		private readonly chainService: ChainService,
	) {}

	@Query(returns => [OrganisationEntity])
	async organisations( @CurrentUser() user: UserEntity ): Promise<OrganisationEntity[]> {
		return this.organisationService.findOrganisationsByUser(user);
	}


	@Query(returns => OrganisationEntity)
	async organisation(@Args('id', { type: () => Int }) id: number): Promise<OrganisationEntity | null> {
		return this.organisationService.findOne(id);
	}

	@Mutation(returns => OrganisationEntity)
	async createOrganisation(@CurrentUser() user: UserEntity, @Args('name') name: string) {
		return this.organisationService.createByName(user, name)
	}


	@Mutation(returns => OrganisationEntity)
	async updateOrganisation(
		@CurrentUser() user: UserEntity,
		@Args('id', { type: () => Int }) id: number,
		@Args('name', { type: () => String }) name: string,
		@Args('countryCode', { type: () => String }) countryCode: string,
		@Args('website', { type: () => String }) website: string,
		@Args('city', { type: () => String }) city: string,
	): Promise<OrganisationEntity> {
		const organisation = await this.organisationService.findOne(id);
		if (!organisation) {
			throw new NotFoundException('Organisation not found');
		}

		return this.organisationService.updateOrganisation(organisation, {
			name,
            countryCode,
            website,
            city,
		});
	}


	@Mutation(returns => Boolean)
	async publishOrganisation(@CurrentUser() user: UserEntity, @Args('id', { type: () => Int }) id: number) {
		const organisation = await this.organisationService.findOne(id);
		if (!organisation) {
			throw new NotFoundException('Organisation not found');
		}
		await this.organisationService.publishOrganisation(id);
		return true
	}


	@Mutation(returns => OrganisationEntity)
    async deleteOrganisation(@CurrentUser() user: UserEntity, @Args('id', { type: () => Int }) id: number): Promise<void> {
      const organisation = await this.organisationService.findOne(id);
      if (!organisation) {
        throw new NotFoundException('Organisation not found');
      }
      await this.organisationService.deleteOrganisationById(id);
    }

	@ResolveField(() => String, { name: 'balance' })
	async getBalance(@Parent() organisation: OrganisationEntity): Promise<string> {
		try {
			const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
			const publicKey = signatureEncoder.decodePublicKey(organisation.publicSignatureKey);
			const balance = await this.chainService.getBalanceOfAccount(publicKey);
			return balance.toString();
		} catch (error) {
			return CMTSToken.zero().toString();
		}
	}

	@ResolveField(() => [UserEntity], { name: 'users' })
	async getUsersInOrganisation(@Parent() organisation: OrganisationEntity): Promise<UserEntity[]> {
		return this.organisationService.findAllUsersInOrganisation(organisation.id);
	}

	@ResolveField(() => Boolean, { name: 'hasTokenAccount' })
	async hasTokenAccount(
		@Parent() organisation: OrganisationEntity,
	) {
		const {publicSignatureKey} = await this.organisationService.findPublicKeyById(organisation.id);
		const publicKeySignatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		return this.chainService.checkAccountExistence(
			publicKeySignatureEncoder.decodePublicKey(publicSignatureKey)
		)
	}

	@ResolveField(() => Boolean, { name: 'isAnchoredOnChain' })
	async isAnchoredOnChain(
		@Parent() organisation: OrganisationEntity,
	) {
		if (organisation.virtualBlockchainId === undefined) return { published: false }
		const published = await this.chainService.checkPublishedOnChain(organisation);
		return { published }
	}

	@ResolveField(() => OrganisationChainStatusType, { name: 'chainStatus' })
	async getChainStatus(
		@Parent() organisation: OrganisationEntity,
	) {
		const {publicSignatureKey} = await this.organisationService.findPublicKeyById(organisation.id);
		const publicKeySignatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		const hasTokenAccount = await this.chainService.checkAccountExistence(
			publicKeySignatureEncoder.decodePublicKey(publicSignatureKey)
		);
		const isPublishedOnChain = await this.chainService.checkPublishedOnChain(organisation);
		return { hasTokenAccount, isPublishedOnChain }
	}

	@ResolveField(() => [TransactionType], { name: 'transactions' })
	async getTransactionsHistory(
		@Parent() organisation: OrganisationEntity,
		@Args('limit', { type: () => Int }) limit: string,
		@Args('fromHistoryHash', { nullable: true }) fromHistoryHash : string | undefined,
	): Promise<TransactionType[]> {
		try {
			const {publicSignatureKey} = await this.organisationService.findPublicKeyById(organisation.id);
			const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
			const accountHistory = await this.chainService.getTransactionsHistory(
				signatureEncoder.decodePublicKey(publicSignatureKey),
				fromHistoryHash,
				parseInt(limit)
			);

			// format the output
			return accountHistory.getAllTransactions().map(entry => {
				return {
					height: entry.getHeight(),
					label: '',
					transferredAt: entry.transferredAt().toLocaleDateString(),
					amount: entry.getAmount().toString(),
					previousHistoryHash: entry.getPreviousHistoryHash().encode(),
					linkedAccount: entry.getLinkedAccount().encode(),
					chainReference: entry.getChainReference().encode(),
				}
			});
		} catch (e) {
			return []
		}
	}

	@Mutation(() => Boolean, { name: 'addUserInOrganisation' })
	async addUserInOrganisation(
		@Args('organisationId', { type: () => Int }) organisationId: number,
		@Args('userPublicKey') userPublicKey: string,
	) {
		await this.organisationService.addUserInOrganisation(organisationId, userPublicKey);
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
}




@UseGuards(GraphQLJwtAuthGuard)
@Resolver(of => ApplicationType)
export class ApplicationResolver {
	private logger = new Logger(ApplicationResolver.name);
	constructor(
		private readonly organisationService: OrganisationService,
		private readonly applicationService: ApplicationService
	) {}

	@Query(() => [ApplicationType], { name: 'getAllApplicationsInOrganisation' })
	async getAllApplicationsInOrganisation(
		@Args('organisationId', { type: () => Int }) organisationId: number,
	): Promise<ApplicationType[]> {
		const applications = await this.applicationService.findAllApplicationsInOrganisationByOrganisationId(organisationId);
		return mapper.mapArray(applications, ApplicationEntity, ApplicationType)
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
		)
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
		if (!organisationIsPublished) throw new ForbiddenException("Publish first the organisation before to publish an application.")

		try {
			await this.applicationService.publishApplication(application.id);
		} catch (e) {
			this.logger.error(e)
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
		return mapper.map(updatedApplication, ApplicationEntity, ApplicationType)
	}

}


@UseGuards(GraphQLJwtAuthGuard)
@Resolver(of => OrganisationStatsDto)
export class OrganisationStatisticsResolver {

	constructor(
		private readonly organisationService: OrganisationService,
	) {}

	@Query(returns => OrganisationStatsDto)
	async getOrganisationStatistics(@Args('id', { type: () => Int }) id: number): Promise<OrganisationStatsDto> {
		const [numberOfApplications, numberOfUsers] = await Promise.all([
			this.organisationService.getNumberOfApplicationsInOrganisation(id),
			this.organisationService.getNumberOfUsersInOrganisation(id)
		])
		return {
			numberOfApplications,
			numberOfUsers,
		}
	}
}
