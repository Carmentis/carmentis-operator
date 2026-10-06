import { BadRequestException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WalletEntity } from '../entities/WalletEntity';
import { PrivateKeyEntity } from '../entities/PrivateKeyEntity';
import { PrivateKeyObjectType } from '../types/types';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { OrganizationEntity } from '../entities/OrganizationEntity';
import { ApiKeyEntity } from '../entities/ApiKeyEntity';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';
import { CatalogService, mergeCatalog } from './CatalogService';
import { EncryptionServiceProxy } from '../shared/transformers/EncryptionServiceProxy';

EncryptionServiceProxy.setInstance({
	encrypt: (value: string) => `enc:${value}`,
	decrypt: (value: string) => value.replace(/^enc:/, ''),
} as any);

const ORG_ID = 'AA'.repeat(32);
const APP_ID = 'BB'.repeat(32);
const ACCOUNT_ID = 'CC'.repeat(32);

describe('mergeCatalog', () => {
	const onChain = (id: string) => ({ virtualBlockchainId: id });

	it('reports a local object without vbId as local-only', () => {
		const local = { vbId: null };
		expect(mergeCatalog([local], [])).toEqual([{ status: 'local-only', local }]);
	});

	it('matches local and on-chain objects whatever the case of the identifier', () => {
		const local = { vbId: ORG_ID.toLowerCase() };
		const remote = onChain(ORG_ID);
		expect(mergeCatalog([local], [remote])).toEqual([{ status: 'synced', local, onChain: remote }]);
	});

	it('reports an on-chain object unknown locally as on-chain-only', () => {
		const remote = onChain(ORG_ID);
		expect(mergeCatalog([], [remote])).toEqual([{ status: 'on-chain-only', onChain: remote }]);
	});

	it('keeps a published object unknown to the indexer as synced (indexer lag)', () => {
		const local = { vbId: ORG_ID };
		expect(mergeCatalog([local], [])).toEqual([{ status: 'synced', local, onChain: undefined }]);
	});
});

describe('CatalogService', () => {
	let dataSource: DataSource;
	let service: CatalogService;
	let wallet: WalletEntity;
	let walletService: { getAccountStatus: jest.Mock };
	let indexer: Record<string, jest.Mock>;

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

		walletService = { getAccountStatus: jest.fn().mockResolvedValue({ attached: true, accountId: ACCOUNT_ID, balance: '1 CMTS' }) };
		indexer = {
			listOrganizationsOfAccount: jest.fn().mockResolvedValue([]),
			listApplicationsOfOrganization: jest.fn().mockResolvedValue([]),
			getOrganizationByVbId: jest.fn().mockResolvedValue(null),
			getApplicationByVbId: jest.fn().mockResolvedValue(null),
		};
		service = new CatalogService(
			dataSource.getRepository(OrganizationEntity),
			dataSource.getRepository(ApplicationEntity),
			walletService as any,
			{ for: () => indexer } as any,
		);
	});

	afterEach(async () => {
		await dataSource.destroy();
	});

	const onChainOrganization = (accountId = ACCOUNT_ID) => ({
		virtualBlockchainId: ORG_ID,
		accountId,
		name: 'Chain org',
		city: 'Paris',
		countryCode: 'FR',
		website: 'https://org.example',
	});

	const onChainApplication = () => ({
		virtualBlockchainId: APP_ID,
		organizationId: ORG_ID,
		name: 'Chain app',
		description: 'desc',
		homepageUrl: 'https://app.example',
		logoUrl: '',
	});

	describe('listing', () => {
		it('offers an on-chain organization missing from the registry', async () => {
			indexer.listOrganizationsOfAccount.mockResolvedValue([onChainOrganization()]);

			const result = await service.listOrganizations(wallet);

			expect(indexer.listOrganizationsOfAccount).toHaveBeenCalledWith(ACCOUNT_ID);
			expect(result.attached).toBe(true);
			expect(result.entries.map((e) => e.status)).toEqual(['on-chain-only']);
		});

		it('does not query the indexer for a wallet without account', async () => {
			walletService.getAccountStatus.mockResolvedValue({ attached: false });

			const result = await service.listOrganizations(wallet);

			expect(indexer.listOrganizationsOfAccount).not.toHaveBeenCalled();
			expect(result).toEqual({ entries: [], attached: false });
		});

		it('still returns the local entries when the chain cannot be read', async () => {
			const local = await dataSource
				.getRepository(OrganizationEntity)
				.save({ name: 'draft', city: 'Paris', countryCode: 'FR', website: 'https://d.example', wallet });
			walletService.getAccountStatus.mockRejectedValue(new Error('node down'));

			const result = await service.listOrganizations(wallet);

			expect(result.onChainError).toBe('node down');
			expect(result.entries).toEqual([{ status: 'local-only', local: expect.objectContaining({ id: local.id }) }]);
		});

		it('lists the applications of every organization owned by the account', async () => {
			indexer.listOrganizationsOfAccount.mockResolvedValue([onChainOrganization()]);
			indexer.listApplicationsOfOrganization.mockResolvedValue([onChainApplication()]);

			const result = await service.listApplications(wallet);

			expect(indexer.listApplicationsOfOrganization).toHaveBeenCalledWith(ORG_ID);
			expect(result.entries.map((e) => e.status)).toEqual(['on-chain-only']);
		});
	});

	describe('importOrganization', () => {
		it('registers an organization owned by the wallet account, with its on-chain values', async () => {
			indexer.getOrganizationByVbId.mockResolvedValue(onChainOrganization());

			const organization = await service.importOrganization(wallet, ORG_ID.toLowerCase());

			expect(organization).toEqual(expect.objectContaining({ vbId: ORG_ID, name: 'Chain org', city: 'Paris' }));
		});

		it('refuses an organization owned by another account', async () => {
			indexer.getOrganizationByVbId.mockResolvedValue(onChainOrganization('DD'.repeat(32)));

			await expect(service.importOrganization(wallet, ORG_ID)).rejects.toThrow(BadRequestException);
		});

		it('refuses a wallet without account', async () => {
			indexer.getOrganizationByVbId.mockResolvedValue(onChainOrganization());
			walletService.getAccountStatus.mockResolvedValue({ attached: false });

			await expect(service.importOrganization(wallet, ORG_ID)).rejects.toThrow(BadRequestException);
		});

		it('refuses an organization unknown to the indexer', async () => {
			await expect(service.importOrganization(wallet, ORG_ID)).rejects.toThrow(/known to the indexer/);
		});

		it('refuses an organization that is already registered', async () => {
			indexer.getOrganizationByVbId.mockResolvedValue(onChainOrganization());
			await service.importOrganization(wallet, ORG_ID);

			await expect(service.importOrganization(wallet, ORG_ID)).rejects.toThrow(ConflictException);
		});
	});

	describe('importApplication', () => {
		it('imports the organization of the application first when it is not registered', async () => {
			indexer.getApplicationByVbId.mockResolvedValue(onChainApplication());
			indexer.getOrganizationByVbId.mockResolvedValue(onChainOrganization());

			const application = await service.importApplication(wallet, APP_ID);

			expect(application).toEqual(expect.objectContaining({ vbId: APP_ID, name: 'Chain app', description: 'desc' }));
			expect(application.organization.vbId).toBe(ORG_ID);
			expect(await dataSource.getRepository(OrganizationEntity).count()).toBe(1);
		});

		it('reuses the registered organization', async () => {
			indexer.getApplicationByVbId.mockResolvedValue(onChainApplication());
			const organization = await dataSource
				.getRepository(OrganizationEntity)
				.save({ vbId: ORG_ID, name: 'known', city: 'Paris', countryCode: 'FR', website: 'https://k.example', wallet });

			const application = await service.importApplication(wallet, APP_ID);

			expect(application.organization.id).toBe(organization.id);
			expect(indexer.getOrganizationByVbId).not.toHaveBeenCalled();
		});

		it('refuses an application unknown to the indexer', async () => {
			await expect(service.importApplication(wallet, APP_ID)).rejects.toThrow(/known to the indexer/);
		});
	});
});
