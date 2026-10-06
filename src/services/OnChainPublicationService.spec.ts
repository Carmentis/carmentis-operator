import { ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Hash, Microblock, SectionType } from '@cmts-dev/carmentis-sdk-core';
import { WalletEntity } from '../entities/WalletEntity';
import { PrivateKeyEntity } from '../entities/PrivateKeyEntity';
import { PrivateKeyObjectType } from '../types/types';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { OrganizationEntity } from '../entities/OrganizationEntity';
import { ApiKeyEntity } from '../entities/ApiKeyEntity';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';
import { OnChainPublicationService } from './OnChainPublicationService';
import { EncryptionServiceProxy } from '../shared/transformers/EncryptionServiceProxy';

EncryptionServiceProxy.setInstance({
	encrypt: (value: string) => `enc:${value}`,
	decrypt: (value: string) => value.replace(/^enc:/, ''),
} as any);

const ACCOUNT_ID = 'AB'.repeat(32);
const NEW_VB_HASH = new Hash(new Uint8Array(32).fill(0xcd));
const NEW_VB_ID = 'CD'.repeat(32);
const ORG_VB_ID = 'EF'.repeat(32);

describe('OnChainPublicationService', () => {
	let dataSource: DataSource;
	let service: OnChainPublicationService;
	let wallet: WalletEntity;
	let walletService: { getAccountStatus: jest.Mock; getPrivateKeyOfWallet: jest.Mock };
	let provider: Record<string, jest.Mock>;
	let microblock: Record<string, jest.Mock>;

	beforeEach(async () => {
		dataSource = new DataSource({
			type: 'sqlite',
			database: ':memory:',
			synchronize: true,
			entities: [WalletEntity, PrivateKeyEntity, OrganizationEntity, ApplicationEntity, ApiKeyEntity, AnchorRequestEntity],
		});
		await dataSource.initialize();

		const privateKey = await dataSource.getRepository(PrivateKeyEntity).save({
			privateKey: { keyType: PrivateKeyObjectType.SEED, schemeId: 0, seed: 'seed-value' },
		});
		const walletRepository = dataSource.getRepository(WalletEntity);
		wallet = await walletRepository.save(
			walletRepository.create({
				name: 'wallet-1',
				actorPassphrase: 'passphrase',
				privateKey,
				rpcEndpoint: 'https://rpc.example',
				indexerEndpoint: 'https://indexer.example',
			}),
		);

		provider = {
			publishMicroblock: jest.fn().mockResolvedValue(NEW_VB_HASH),
			awaitMicroblockAnchoring: jest.fn().mockResolvedValue(undefined),
			getVirtualBlockchainStatus: jest.fn().mockResolvedValue({}),
		};
		jest.spyOn(WalletEntity.prototype, 'getProvider').mockReturnValue(provider as any);

		microblock = { addSection: jest.fn(), addSections: jest.fn(), setGasPrice: jest.fn(), setGasAndSeal: jest.fn() };
		jest.spyOn(Microblock, 'createGenesisOrganizationMicroblock').mockReturnValue(microblock as any);
		jest.spyOn(Microblock, 'createGenesisApplicationMicroblock').mockReturnValue(microblock as any);

		walletService = {
			getAccountStatus: jest.fn().mockResolvedValue({ attached: true, accountId: ACCOUNT_ID, balance: '1 CMTS' }),
			getPrivateKeyOfWallet: jest.fn().mockResolvedValue({ secret: 'key' }),
		};
		service = new OnChainPublicationService(
			dataSource.getRepository(OrganizationEntity),
			dataSource.getRepository(ApplicationEntity),
			walletService as any,
		);
	});

	afterEach(async () => {
		jest.restoreAllMocks();
		await dataSource.destroy();
	});

	const createOrganization = (vbId: string | null = null) =>
		dataSource
			.getRepository(OrganizationEntity)
			.save({ vbId, name: 'org', city: 'Paris', countryCode: 'FR', website: 'https://org.example', wallet });

	const createApplication = (organization: OrganizationEntity) =>
		dataSource.getRepository(ApplicationEntity).save({ name: 'app', description: 'd', wallet, organization });

	describe('publishOrganization', () => {
		it('creates the organization virtual blockchain, paid by the wallet account, and stores its id', async () => {
			const organization = await createOrganization();

			const published = await service.publishOrganization(organization.id);

			expect(published.vbId).toBe(NEW_VB_ID);
			const [sections] = microblock.addSections.mock.calls[0];
			expect(sections[0]).toEqual({ type: SectionType.ORG_CREATION, accountId: Hash.fromHex(ACCOUNT_ID).toBytes() });
			expect(sections[1]).toEqual(expect.objectContaining({ type: SectionType.ORG_DESCRIPTION, name: 'org', city: 'Paris' }));
			expect(microblock.setGasAndSeal).toHaveBeenCalledWith(provider, { secret: 'key' }, { feesPayerAccount: Hash.fromHex(ACCOUNT_ID).toBytes() });
			expect(provider.publishMicroblock).toHaveBeenCalledWith(microblock);
			const reloaded = await dataSource.getRepository(OrganizationEntity).findOneByOrFail({ id: organization.id });
			expect(reloaded.vbId).toBe(NEW_VB_ID);
		});

		it('appends a description microblock to an organization that is already published', async () => {
			const organization = await createOrganization(ORG_VB_ID);
			const update = { addSection: jest.fn(), setGasPrice: jest.fn(), setGasAndSeal: jest.fn() };
			const loadOrganization = jest.fn().mockResolvedValue({ createMicroblock: jest.fn().mockResolvedValue(update) });
			provider.loadOrganizationVirtualBlockchain = loadOrganization;

			const published = await service.publishOrganization(organization.id);

			expect(published.vbId).toBe(ORG_VB_ID);
			expect(loadOrganization).toHaveBeenCalledWith(Hash.fromHex(ORG_VB_ID));
			expect(update.addSection).toHaveBeenCalledWith(expect.objectContaining({ type: SectionType.ORG_DESCRIPTION }));
			expect(Microblock.createGenesisOrganizationMicroblock).not.toHaveBeenCalled();
		});

		it('refuses a wallet that is not attached to an account, publishing nothing', async () => {
			const organization = await createOrganization();
			walletService.getAccountStatus.mockResolvedValue({ attached: false });

			await expect(service.publishOrganization(organization.id)).rejects.toThrow(ConflictException);
			expect(provider.publishMicroblock).not.toHaveBeenCalled();
		});

		it('keeps the organization published when the anchoring cannot be confirmed', async () => {
			const organization = await createOrganization();
			provider.awaitMicroblockAnchoring.mockRejectedValue(new Error('timeout'));

			const published = await service.publishOrganization(organization.id);

			expect(published.vbId).toBe(NEW_VB_ID);
		});

		it('refuses two concurrent publications of the same organization', async () => {
			const organization = await createOrganization();
			let release!: () => void;
			provider.publishMicroblock.mockReturnValue(new Promise((resolve) => (release = () => resolve(NEW_VB_HASH))));

			const first = service.publishOrganization(organization.id);
			await new Promise((resolve) => setTimeout(resolve, 50));
			await expect(service.publishOrganization(organization.id)).rejects.toThrow(/already in progress/);

			release();
			await expect(first).resolves.toBeDefined();
			expect(provider.publishMicroblock).toHaveBeenCalledTimes(1);
		});
	});

	describe('publishApplication', () => {
		it('creates the application under its published organization and stores its id', async () => {
			const application = await createApplication(await createOrganization(ORG_VB_ID));

			const published = await service.publishApplication(application.id);

			expect(published.vbId).toBe(NEW_VB_ID);
			const [sections] = microblock.addSections.mock.calls[0];
			expect(sections[0]).toEqual({ type: SectionType.APP_CREATION, organizationId: Hash.fromHex(ORG_VB_ID).toBytes() });
			expect(sections[1]).toEqual(expect.objectContaining({ type: SectionType.APP_DESCRIPTION, name: 'app', description: 'd' }));
		});

		it('requires the organization to be published first', async () => {
			const application = await createApplication(await createOrganization());

			await expect(service.publishApplication(application.id)).rejects.toThrow(/must be published/);
			expect(provider.publishMicroblock).not.toHaveBeenCalled();
		});

		it('asks to retry while the organization is not anchored on the node yet', async () => {
			const application = await createApplication(await createOrganization(ORG_VB_ID));
			provider.getVirtualBlockchainStatus.mockResolvedValue(null);

			await expect(service.publishApplication(application.id)).rejects.toThrow(/not anchored on-chain yet/);
			expect(provider.publishMicroblock).not.toHaveBeenCalled();
		});

		it('refuses a wallet that is not attached to an account', async () => {
			const application = await createApplication(await createOrganization(ORG_VB_ID));
			walletService.getAccountStatus.mockResolvedValue({ attached: false });

			await expect(service.publishApplication(application.id)).rejects.toThrow(ConflictException);
		});
	});
});
