import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
	ApplicationDescriptionSection,
	CMTSToken,
	Hash,
	Microblock,
	OrganizationDescriptionSection,
	SectionType,
} from '@cmts-dev/carmentis-sdk-core';
import { OrganizationEntity } from '../entities/OrganizationEntity';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { WalletEntity } from '../entities/WalletEntity';
import { WalletService } from './WalletService';
import { VbUtils } from '../utils/VbUtils';

/** Same price as the one used when publishing from Carmentis Desk. */
const PUBLICATION_GAS_PRICE = CMTSToken.createMilliToken(1);

/**
 * Publishes organizations and applications of the local registry on-chain, creating their
 * virtual blockchain the first time and appending a new description microblock afterwards.
 *
 * Publishing requires the wallet to be attached to an on-chain account, which pays the fees.
 */
@Injectable()
export class OnChainPublicationService {
	private readonly logger = new Logger(OnChainPublicationService.name);

	/** Guards against two concurrent publications of the same object (which would create two virtual blockchains). */
	private readonly inProgress = new Set<string>();

	constructor(
		@InjectRepository(OrganizationEntity)
		private readonly organizationRepository: Repository<OrganizationEntity>,
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
		private readonly walletService: WalletService,
	) {}

	async publishOrganization(organizationId: number): Promise<OrganizationEntity> {
		return this.exclusively(`organization:${organizationId}`, async () => {
			const organization = await this.organizationRepository.findOne({
				where: { id: organizationId },
				relations: { wallet: true },
			});
			if (!organization) throw new NotFoundException('Organization not found');

			const { provider, sk, accountId } = await this.getPublisher(organization.wallet);
			const description: OrganizationDescriptionSection = {
				type: SectionType.ORG_DESCRIPTION,
				name: organization.name,
				city: organization.city,
				countryCode: organization.countryCode,
				website: organization.website,
			};

			if (organization.vbId) {
				const organizationVb = await provider.loadOrganizationVirtualBlockchain(Hash.fromHex(organization.vbId));
				const mb = await organizationVb.createMicroblock();
				mb.addSection(description);
				await this.sealAndPublish(provider, mb, sk, accountId);
				return organization;
			}

			const mb = Microblock.createGenesisOrganizationMicroblock();
			mb.addSections([{ type: SectionType.ORG_CREATION, accountId: accountId.toBytes() }, description]);
			const hash = await this.sealAndPublish(provider, mb, sk, accountId);

			// persisted right away: from here on the organization exists on-chain
			organization.vbId = VbUtils.normalizeVbId(hash.encode());
			await this.organizationRepository.save(organization);
			await this.awaitAnchoring(provider, hash);
			return organization;
		});
	}

	async publishApplication(applicationId: number): Promise<ApplicationEntity> {
		return this.exclusively(`application:${applicationId}`, async () => {
			const application = await this.applicationRepository.findOne({
				where: { id: applicationId },
				relations: { wallet: true, organization: true },
			});
			if (!application) throw new NotFoundException('Application not found');
			if (!application.organization.vbId) {
				throw new ConflictException(
					`The organization "${application.organization.name}" must be published before its applications`,
				);
			}

			const { provider, sk, accountId } = await this.getPublisher(application.wallet);
			const organizationVbId = Hash.fromHex(application.organization.vbId);
			if (!(await provider.getVirtualBlockchainStatus(organizationVbId.toBytes()))) {
				throw new ConflictException(
					`The organization "${application.organization.name}" is not anchored on-chain yet: retry in a few seconds`,
				);
			}

			const description: ApplicationDescriptionSection = {
				type: SectionType.APP_DESCRIPTION,
				name: application.name,
				description: application.description,
				homepageUrl: application.homepageUrl,
				logoUrl: application.logoUrl,
			};

			if (application.vbId) {
				const applicationVb = await provider.loadApplicationVirtualBlockchain(Hash.fromHex(application.vbId));
				const mb = await applicationVb.createMicroblock();
				mb.addSection(description);
				await this.sealAndPublish(provider, mb, sk, accountId);
				return application;
			}

			const mb = Microblock.createGenesisApplicationMicroblock();
			mb.addSections([{ type: SectionType.APP_CREATION, organizationId: organizationVbId.toBytes() }, description]);
			const hash = await this.sealAndPublish(provider, mb, sk, accountId);

			application.vbId = VbUtils.normalizeVbId(hash.encode());
			await this.applicationRepository.save(application);
			await this.awaitAnchoring(provider, hash);
			return application;
		});
	}

	/** @throws ConflictException If the wallet is not attached to an on-chain account. */
	private async getPublisher(wallet: WalletEntity) {
		const status = await this.walletService.getAccountStatus(wallet);
		if (!status.attached) {
			throw new ConflictException(
				`The wallet "${wallet.name}" is not attached to an on-chain account: publishing is not available`,
			);
		}
		return {
			provider: wallet.getProvider(),
			sk: await this.walletService.getPrivateKeyOfWallet(wallet.id),
			accountId: Hash.fromHex(status.accountId),
		};
	}

	private async sealAndPublish(
		provider: ReturnType<WalletEntity['getProvider']>,
		mb: Microblock,
		sk: Awaited<ReturnType<WalletService['getPrivateKeyOfWallet']>>,
		accountId: Hash,
	): Promise<Hash> {
		mb.setGasPrice(PUBLICATION_GAS_PRICE);
		await mb.setGasAndSeal(provider, sk, { feesPayerAccount: accountId.toBytes() });
		return provider.publishMicroblock(mb);
	}

	/** The object is already published at this point: a slow anchoring must not turn into a failure. */
	private async awaitAnchoring(provider: ReturnType<WalletEntity['getProvider']>, hash: Hash) {
		try {
			await provider.awaitMicroblockAnchoring(hash.toBytes());
		} catch (error) {
			this.logger.warn(`Could not confirm the anchoring of microblock ${hash.encode()}: ${error}`);
		}
	}

	private async exclusively<T>(key: string, task: () => Promise<T>): Promise<T> {
		if (this.inProgress.has(key)) {
			throw new ConflictException('A publication of this object is already in progress');
		}
		this.inProgress.add(key);
		try {
			return await task();
		} finally {
			this.inProgress.delete(key);
		}
	}
}
