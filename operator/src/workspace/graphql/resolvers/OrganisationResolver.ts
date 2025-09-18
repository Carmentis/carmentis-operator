import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { OrganisationEntity } from '../../../shared/entities/OrganisationEntity';
import { OrganisationService } from '../../../shared/services/OrganisationService';
import { BadRequestException, Logger, NotFoundException, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../decorators/CurrentUserDecorator';
import { UserEntity } from '../../../shared/entities/UserEntity';
import ChainService from '../../../shared/services/ChainService';
import { TransactionType } from '../types/TransactionType';
import { CMTSToken, StringSignatureEncoder, Transaction } from '@cmts-dev/carmentis-sdk/server';
import { OrganisationChainStatusType } from '../types/OrganisationChainStatusType';
import { GraphQLJwtAuthGuard } from '../../guards/GraphQLJwtAuthGuard';
import { OrganisationByIdPipe } from '../../pipes/OrganisationByIdPipe';
import { NodeEntity } from '../../../shared/entities/NodeEntity';
import { OrganisationUpdateDto } from '../dto/OrganisationUpdateDto';

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
	async createOrganisation(
		@CurrentUser() user: UserEntity,
		@Args('name') name: string,
		@Args('privateKey', { nullable: true }) privateKey?: string,
	) {
		return this.organisationService.createByName(user, name, privateKey)
	}


	@Mutation(returns => OrganisationEntity)
	async updateOrganisation(
		@CurrentUser() user: UserEntity,
		/*
		@Args('id', { type: () => Int }) id: number,
		@Args('name', { type: () => String }) name: string,
		@Args('countryCode', { type: () => String }) countryCode: string,
		@Args('website', { type: () => String }) website: string,
		@Args('city', { type: () => String }) city: string,

		 */
		@Args('organisation', {type: () => OrganisationUpdateDto})
		organisationDto: OrganisationUpdateDto,
	): Promise<OrganisationEntity> {
		// search the organisation
		const {id, countryCode, name, city, website} = organisationDto;
		const organisation = await this.organisationService.findOne(id);
		if (!organisation) {
			throw new NotFoundException('Organisation not found');
		}

		// perform validity check
		console.log("update org:", organisationDto)
		console.log("coutry code:", countryCode)
		if (countryCode.length !== 2) throw new BadRequestException('Country code should be two letters long');



		return this.organisationService.updateOrganisation(organisation, {
			name,
            countryCode,
            website,
            city,
		});
	}

	@Mutation(returns => Boolean)
	async forceChainSync(
		@CurrentUser() user: UserEntity,
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

	@ResolveField(() => [NodeEntity], { name: 'nodes' })
	async getNodesInOrganisation(@Parent() organisation: OrganisationEntity): Promise<NodeEntity[]> {
		return this.organisationService.findAllNodesInOrganisation(organisation.id);
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
		const hasEditedOrganization = organisation.isReadyToBePublished();
		const isPublishedOnChain = await this.chainService.checkPublishedOnChain(organisation);
		return { hasTokenAccount, isPublishedOnChain, hasEditedOrganization }
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
					label: this.formatTransactionLabel(entry),
					transferredAt: entry.transferredAt().toLocaleDateString(),
					amount: entry.getAmount().toString(),
					amountInAtomics: entry.getAmount().getAmountAsAtomic(),
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

	private formatTransactionLabel(transaction: Transaction): string {
		if (transaction.isPurchase()) return 'Purchase';
		if (transaction.isSale()) return 'Sale';
		if (transaction.isReceivedPayment()) return 'Received payment';
		if (transaction.isSentPayment()) return 'Sent payment';
		if (transaction.isEarnedFees()) return "Earned fees";
		if (transaction.isPaidFees()) return "Paid fees";
		return 'Unspecified';
	}
}




