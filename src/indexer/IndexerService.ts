import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
	appControllerGetAccounts,
	appControllerGetApplications,
	appControllerGetMicroblocks,
	appControllerGetOrganizations,
} from '../generated';
import type { AccountDto, ApplicationDto, MicroblockDto, OrganizationDto } from '../generated/models';
import type { WalletEntity } from '../entities/WalletEntity';

const PAGE_SIZE = 100;
/** Safety net against an indexer that keeps answering `hasMore: true`. */
const MAX_PAGES = 50;

/** Typed access to the indexer of a given wallet (each wallet has its own `indexerEndpoint`). */
export class WalletIndexer {
	constructor(private readonly baseUrl: string) {}

	async getAccountById(accountIdHex: string): Promise<AccountDto | null> {
		const { data } = await appControllerGetAccounts({ id: accountIdHex }, { baseUrl: this.baseUrl });
		return data.items[0] ?? null;
	}

	async getOrganizationByVbId(vbId: string): Promise<OrganizationDto | null> {
		const { data } = await appControllerGetOrganizations({ vb_id: vbId }, { baseUrl: this.baseUrl });
		return data.items[0] ?? null;
	}

	async getApplicationByVbId(vbId: string): Promise<ApplicationDto | null> {
		const { data } = await appControllerGetApplications({ vb_id: vbId }, { baseUrl: this.baseUrl });
		return data.items[0] ?? null;
	}

	async findMicroblockByHash(hashHex: string): Promise<MicroblockDto | null> {
		const { data } = await appControllerGetMicroblocks({ hash: hashHex, limit: 1 }, { baseUrl: this.baseUrl });
		return data.items[0] ?? null;
	}

	listOrganizationsOfAccount(accountIdHex: string): Promise<OrganizationDto[]> {
		return this.collectAll((offset) =>
			appControllerGetOrganizations(
				{ account_id: accountIdHex, offset, limit: PAGE_SIZE },
				{ baseUrl: this.baseUrl },
			).then((r) => r.data),
		);
	}

	listApplicationsOfOrganization(organizationVbId: string): Promise<ApplicationDto[]> {
		return this.collectAll((offset) =>
			appControllerGetApplications(
				{ organization_id: organizationVbId, offset, limit: PAGE_SIZE },
				{ baseUrl: this.baseUrl },
			).then((r) => r.data),
		);
	}

	private async collectAll<T>(fetchPage: (offset: number) => Promise<{ items: T[]; hasMore: boolean }>): Promise<T[]> {
		const all: T[] = [];
		for (let page = 0; page < MAX_PAGES; page++) {
			const { items, hasMore } = await fetchPage(page * PAGE_SIZE);
			all.push(...items);
			if (!hasMore || items.length === 0) break;
		}
		return all;
	}
}

@Injectable()
export class IndexerService {
	/** @throws ServiceUnavailableException If the wallet has no indexer configured. */
	for(wallet: Pick<WalletEntity, 'indexerEndpoint'>): WalletIndexer {
		if (!wallet.indexerEndpoint) {
			throw new ServiceUnavailableException('No indexer is configured for this wallet');
		}
		return new WalletIndexer(wallet.indexerEndpoint);
	}
}
