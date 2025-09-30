import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { OrganisationEntity } from '../../../../../shared/entities/OrganisationEntity';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { OrganizationMemberRestrictedOrganizationGuard } from '../../../../guards/OrganizationMemberRestrictedOrganizationGuard';
import { JwtProtectedResolver } from '../JwtProtectedResolver';
import { OrganisationByIdPipe } from '../../../../pipes/OrganisationByIdPipe';
import { Transaction } from '@cmts-dev/carmentis-sdk';
import { CMTSToken, StringSignatureEncoder } from '@cmts-dev/carmentis-sdk/server';
import { CurrentUser } from '../../../../decorators/CurrentUserDecorator';
import { UserEntity } from '../../../../../shared/entities/UserEntity';
import ChainService from '../../../../../shared/services/ChainService';
import { OrganisationService } from '../../../../../shared/services/OrganisationService';
import { NodeEntity } from '../../../../../shared/entities/NodeEntity';
import { OrganisationChainStatusType } from '../../../types/OrganisationChainStatusType';
import { TransactionType } from '../../../types/TransactionType';

@Resolver(of => OrganisationEntity)
@UseGuards(OrganizationMemberRestrictedOrganizationGuard)
export class OrganizationAdditionalFieldsResolver extends JwtProtectedResolver {
	constructor(
		private readonly organisationService: OrganisationService,
		private readonly chainService: ChainService,
	) { super() }

	@ResolveField(() => String, { name: 'balance' })
	async getBalance(
		@CurrentUser() user: UserEntity,
		@Parent() organisation: OrganisationEntity
	): Promise<string> {
		const isAuthorized = this.organisationService.isAuthorizedUser(user, organisation);
		if (!isAuthorized) throw new ForbiddenException();
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