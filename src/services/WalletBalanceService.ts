import { Injectable } from '@nestjs/common';
import { IndexerService } from '../indexer/IndexerService';
import type { AccountDto } from '../generated/models';
import type { WalletEntity } from '../entities/WalletEntity';
import { AccountStatus, WalletService } from './WalletService';
import { formatAtomicsAsCmts } from '../utils/TokenFormat';

/** How the tokens of an account split up, as reported by the indexer (amounts formatted as CMTS). */
export interface TokenBreakdown {
	spendable: string;
	lockedInStaking: string;
	lockedInVesting: string;
	lockedInEscrows: string;
	/** Number of locks behind each locked amount. */
	stakingLocks: number;
	vestingLocks: number;
	escrowLocks: number;
	/** Height of the account as seen by the indexer. */
	indexedHeight: number;
	/** False when the indexer's total differs from the node's, i.e. the indexer is lagging behind. */
	inSync: boolean;
}

export type WalletBalances =
	| { attached: false }
	| {
			attached: true;
			accountId: string;
			/** Total, read from the node: spendable plus everything locked. */
			balance: string;
			breakdown?: TokenBreakdown;
			/** Why the breakdown is missing: the node answer is still valid. */
			breakdownError?: string;
	  };

const format = formatAtomicsAsCmts;

export function toBreakdown(account: AccountDto, nodeBalance: string): TokenBreakdown {
	return {
		spendable: format(account.spendable),
		lockedInStaking: format(account.lockedInStaking),
		lockedInVesting: format(account.lockedInVesting),
		lockedInEscrows: format(account.lockedInEscrows),
		stakingLocks: account.stakingLocks?.length ?? 0,
		vestingLocks: account.vestingLocks?.length ?? 0,
		escrowLocks: account.escrowLocks?.length ?? 0,
		indexedHeight: account.height,
		inSync: format(account.balance) === nodeBalance,
	};
}

/**
 * Tokens of the account of a wallet: the total comes from the node (authoritative), the split
 * between spendable and locked tokens comes from the indexer, which is best-effort: when it is
 * unreachable or does not know the account yet, the total is still returned.
 */
@Injectable()
export class WalletBalanceService {
	constructor(
		private readonly walletService: WalletService,
		private readonly indexerService: IndexerService,
	) {}

	/** @throws If the node cannot be reached, as {@link WalletService.getAccountStatus}. */
	async getBalances(wallet: WalletEntity): Promise<WalletBalances> {
		const status: AccountStatus = await this.walletService.getAccountStatus(wallet);
		if (!status.attached) {
			return status;
		}
		try {
			const account = await this.indexerService.for(wallet).getAccountById(status.accountId);
			if (!account) {
				return { ...status, breakdownError: 'The indexer does not know this account yet.' };
			}
			return { ...status, breakdown: toBreakdown(account, status.balance) };
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			return { ...status, breakdownError: reason };
		}
	}
}
