import { Args, Int, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { OrganisationEntity } from '../../../../../shared/entities/OrganisationEntity';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import {
	OrganizationMemberRestrictedOrganizationGuard,
} from '../../../../guards/OrganizationMemberRestrictedOrganizationGuard';
import { JwtProtectedResolver } from '../JwtProtectedResolver';
import { AccountTransactions, Transaction } from '@cmts-dev/carmentis-sdk/server';
import { CMTSToken, CryptoEncoderFactory, SignatureSchemeId } from '@cmts-dev/carmentis-sdk/server';
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
			const publicKey = await organisation.getPublicSignatureKey();
			const balance = await this.chainService.getBalanceOfAccount(publicKey);
			return balance.toString();
		} catch (error) {
			return CMTSToken.zero().toString();
		}
	}

	@ResolveField(() => [UserEntity], { name: 'users' })
	async getUsersInOrganisation(@Parent() organisation: OrganisationEntity): Promise<UserEntity[]> {
		return await this.organisationService.findAllUsersInOrganisation(organisation.id);
	}

	@ResolveField(() => [NodeEntity], { name: 'nodes' })
	async getNodesInOrganisation(@Parent() organisation: OrganisationEntity): Promise<NodeEntity[]> {
		return await this.organisationService.findAllNodesInOrganisation(organisation.id);
	}


	@ResolveField(() => Boolean, { name: 'hasTokenAccount' })
	async hasTokenAccount(
		@Parent() organisation: OrganisationEntity,
	) {
		const publicKey = await organisation.getPublicSignatureKey();
		return await this.chainService.checkAccountExistence(publicKey)
	}

	@ResolveField(() => Boolean, { name: 'isAnchoredOnChain' })
	async isAnchoredOnChain(
		@Parent() organisation: OrganisationEntity,
	) {
		const published = await this.chainService.checkPublishedOnChain(organisation);
		return { published }
	}


	/**
	 * Returns the public key of the organization.
	 * @param organisation
	 */
	@ResolveField(() => String, { name: 'publicSignatureKey' })
	async getPublicSignatureKey(
		@Parent() organisation: OrganisationEntity,
	) {
		const usedSchemeId=  SignatureSchemeId.SECP256K1;
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		return encoder.encodePublicKey(
			await organisation.getPublicSignatureKey(usedSchemeId)
		);
	}

	/**
	 * Returns the private signature key of the organization.
	 * @param organisation
	 */
	@ResolveField(() => String, { name: 'privateSignatureKey' })
	async getPrivateSignatureKey(
		@Parent() organisation: OrganisationEntity,
	) {
		return this.organisationService.getEncodedPrivateSignatureKey(organisation.id);
	}

	/**
	 * Returns the wallet seed of the organization.
	 * @param organisation
	 */
	@ResolveField(() => String, { name: 'walletSeed' })
	async getWalletSeed(
		@Parent() organisation: OrganisationEntity,
	) {
		return this.organisationService.getWalletSeed(organisation.id);
	}

	@ResolveField(() => OrganisationChainStatusType, { name: 'chainStatus' })
	async getChainStatus(
		@Parent() organisation: OrganisationEntity,
	) {
		const publicKey = await organisation.getPublicSignatureKey();
		const hasTokenAccount = await this.chainService.checkAccountExistence(publicKey);
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
			const publicKey = await organisation.getPublicSignatureKey();
			const accountHistory = await this.chainService.getTransactionsHistory(
				publicKey,
				fromHistoryHash,
				parseInt(limit)
			);

			// format the output
			const transactions = AccountTransactions.createFromAbciResponse(accountHistory);
			return transactions.getTransactions().map(entry => {
				return {
					height: entry.getHeight(),
					label: entry.getTransactionTypeLabel(),
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
}