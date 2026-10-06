import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../entities/OrganizationEntity';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { WalletEntity } from '../entities/WalletEntity';
import { WalletService } from './WalletService';
import { IndexerService } from '../indexer/IndexerService';
import type { ApplicationDto, OrganizationDto } from '../generated/models';
import { VbUtils } from '../utils/VbUtils';

/**
 * - `local-only`: in the local registry, not (yet) on-chain
 * - `synced`: in the local registry and found on-chain
 * - `on-chain-only`: found on-chain, not in the local registry (can be imported)
 */
export type CatalogStatus = 'local-only' | 'synced' | 'on-chain-only';

export interface CatalogEntry<Local, OnChain> {
	status: CatalogStatus;
	local?: Local;
	onChain?: OnChain;
}

export interface CatalogResult<Local, OnChain> {
	entries: CatalogEntry<Local, OnChain>[];
	/** Whether the wallet is attached to an on-chain account (publishing is only possible then). Unknown when the node could not be queried. */
	attached?: boolean;
	/** Set when the on-chain side could not be read: only local entries are then returned. */
	onChainError?: string;
}

/**
 * Pure merge of the local registry with what the indexer reports, matching on `vbId`
 * (case-insensitively: the indexer answers in upper-case hexadecimal).
 */
export function mergeCatalog<Local extends { vbId: string | null }, OnChain extends { virtualBlockchainId: string }>(
	locals: Local[],
	onChains: OnChain[],
): CatalogEntry<Local, OnChain>[] {
	const onChainById = new Map(onChains.map((o) => [VbUtils.normalizeVbId(o.virtualBlockchainId), o]));
	const matched = new Set<string>();

	const entries: CatalogEntry<Local, OnChain>[] = locals.map((local) => {
		if (!local.vbId) return { status: 'local-only', local };
		const key = VbUtils.normalizeVbId(local.vbId);
		const onChain = onChainById.get(key);
		if (onChain) matched.add(key);
		// A published object the indexer does not know (yet) is still reported as synced:
		// the local vbId is the source of truth right after a publication.
		return { status: 'synced', local, onChain };
	});

	for (const [key, onChain] of onChainById) {
		if (!matched.has(key)) entries.push({ status: 'on-chain-only', onChain });
	}
	return entries;
}

@Injectable()
export class CatalogService {
	constructor(
		@InjectRepository(OrganizationEntity)
		private readonly organizationRepository: Repository<OrganizationEntity>,
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
		private readonly walletService: WalletService,
		private readonly indexerService: IndexerService,
	) {}

	/** Organizations of the wallet: local ones merged with those the wallet's account owns on-chain. */
	async listOrganizations(wallet: WalletEntity): Promise<CatalogResult<OrganizationEntity, OrganizationDto>> {
		const locals = await this.organizationRepository.find({
			where: { wallet: { id: wallet.id } },
			order: { createdAt: 'DESC' },
		});
		try {
			const status = await this.walletService.getAccountStatus(wallet);
			// no account, hence nothing can be owned on-chain
			const onChains = status.attached
				? await this.indexerService.for(wallet).listOrganizationsOfAccount(status.accountId)
				: [];
			return { entries: mergeCatalog(locals, onChains), attached: status.attached };
		} catch (error) {
			return { entries: mergeCatalog(locals, []), onChainError: describe(error) };
		}
	}

	/** Applications of the wallet: local ones merged with those of every organization the wallet's account owns on-chain. */
	async listApplications(wallet: WalletEntity): Promise<CatalogResult<ApplicationEntity, ApplicationDto>> {
		const locals = await this.applicationRepository.find({
			where: { wallet: { id: wallet.id } },
			relations: { organization: true },
			order: { createdAt: 'DESC' },
		});
		try {
			const status = await this.walletService.getAccountStatus(wallet);
			if (!status.attached) return { entries: mergeCatalog(locals, []), attached: false };
			const indexer = this.indexerService.for(wallet);
			const organizations = await indexer.listOrganizationsOfAccount(status.accountId);
			const onChains = (
				await Promise.all(organizations.map((o) => indexer.listApplicationsOfOrganization(o.virtualBlockchainId)))
			).flat();
			return { entries: mergeCatalog(locals, onChains), attached: true };
		} catch (error) {
			return { entries: mergeCatalog(locals, []), onChainError: describe(error) };
		}
	}

	/**
	 * Registers locally an organization that exists on-chain.
	 *
	 * @throws BadRequestException If the organization is unknown to the indexer or is not owned by the wallet's account.
	 * @throws ConflictException If it is already registered.
	 */
	async importOrganization(wallet: WalletEntity, vbId: string): Promise<OrganizationEntity> {
		const normalized = VbUtils.normalizeVbId(vbId);
		if (await this.organizationRepository.existsBy({ vbId: normalized })) {
			throw new ConflictException('This organization is already registered');
		}
		const indexer = this.indexerService.for(wallet);
		const onChain = await indexer.getOrganizationByVbId(normalized);
		if (!onChain) {
			throw new BadRequestException(`No organization ${normalized} is known to the indexer of this wallet`);
		}
		const status = await this.walletService.getAccountStatus(wallet);
		if (!status.attached || VbUtils.normalizeVbId(status.accountId) !== VbUtils.normalizeVbId(onChain.accountId)) {
			throw new BadRequestException("This organization does not belong to the wallet's account");
		}
		return this.organizationRepository.save(
			this.organizationRepository.create({
				vbId: normalized,
				name: onChain.name,
				city: onChain.city,
				countryCode: onChain.countryCode,
				website: onChain.website,
				wallet,
			}),
		);
	}

	/**
	 * Registers locally an application that exists on-chain, importing its organization first
	 * when it is not registered yet.
	 *
	 * @throws BadRequestException If the application is unknown to the indexer or its organization is not owned by the wallet's account.
	 * @throws ConflictException If it is already registered.
	 */
	async importApplication(wallet: WalletEntity, vbId: string): Promise<ApplicationEntity> {
		const normalized = VbUtils.normalizeVbId(vbId);
		if (await this.applicationRepository.existsBy({ vbId: normalized })) {
			throw new ConflictException('This application is already registered');
		}
		const onChain = await this.indexerService.for(wallet).getApplicationByVbId(normalized);
		if (!onChain) {
			throw new BadRequestException(`No application ${normalized} is known to the indexer of this wallet`);
		}

		const organizationVbId = VbUtils.normalizeVbId(onChain.organizationId);
		const organization =
			(await this.organizationRepository.findOne({
				where: { vbId: organizationVbId, wallet: { id: wallet.id } },
			})) ?? (await this.importOrganization(wallet, organizationVbId));

		return this.applicationRepository.save(
			this.applicationRepository.create({
				vbId: normalized,
				name: onChain.name,
				description: onChain.description,
				homepageUrl: onChain.homepageUrl,
				logoUrl: onChain.logoUrl,
				wallet,
				organization,
			}),
		);
	}

	async getWalletOrFail(walletId: number): Promise<WalletEntity> {
		const wallet = await WalletEntity.findOneBy({ id: walletId });
		if (!wallet) throw new NotFoundException('Wallet not found');
		return wallet;
	}
}

function describe(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
