import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WalletEntity } from '../entities/WalletEntity';
import { PrivateKeyEntity } from '../entities/PrivateKeyEntity';
import { PrivateKeyObjectType } from '../types/types';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { OrganizationEntity } from '../entities/OrganizationEntity';
import { ApiKeyEntity } from '../entities/ApiKeyEntity';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';
import { ApplicationService } from './ApplicationService';
import { EncryptionServiceProxy } from '../shared/transformers/EncryptionServiceProxy';

// WalletEntity.seed is an @EncryptedColumn(); see WalletService.spec.ts for details.
EncryptionServiceProxy.setInstance({
	encrypt: (value: string) => `enc:${value}`,
	decrypt: (value: string) => value.replace(/^enc:/, ''),
} as any);

describe('ApplicationService', () => {
	let dataSource: DataSource;
	let service: ApplicationService;
	let wallet: WalletEntity;
	let organization: OrganizationEntity;

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

		organization = await dataSource
			.getRepository(OrganizationEntity)
			.save({ name: 'org', city: 'Paris', countryCode: 'FR', website: 'https://org.example', wallet });

		service = new ApplicationService(
			dataSource.getRepository(ApplicationEntity),
			dataSource.getRepository(OrganizationEntity),
			walletRepository,
		);
	});

	afterEach(async () => {
		await dataSource.destroy();
	});

	async function createApplication(vbId: string | null = 'aa'): Promise<ApplicationEntity> {
		const repository = dataSource.getRepository(ApplicationEntity);
		return repository.save(repository.create({ vbId, name: 'app', wallet, organization }));
	}

	it('creates a local application that is not published yet', async () => {
		const application = await service.createApplication({
			name: 'my app',
			description: 'about',
			walletId: wallet.id,
			organizationId: organization.id,
		});

		expect(application.vbId).toBeNull();
		expect(application.name).toBe('my app');
		expect(application.homepageUrl).toBe('');
	});

	it('refuses to create an application under an organization of another wallet', async () => {
		const otherWallet = await dataSource
			.getRepository(WalletEntity)
			.save({ ...wallet, id: undefined, name: 'wallet-2' } as WalletEntity);
		const foreignOrganization = await dataSource
			.getRepository(OrganizationEntity)
			.save({ name: 'other', city: 'Lyon', countryCode: 'FR', website: 'https://o.example', wallet: otherWallet });

		await expect(
			service.createApplication({ name: 'x', walletId: wallet.id, organizationId: foreignOrganization.id }),
		).rejects.toThrow(BadRequestException);
	});

	it('refuses to create an application for an unknown wallet', async () => {
		await expect(
			service.createApplication({ name: 'x', walletId: 9999, organizationId: organization.id }),
		).rejects.toThrow(NotFoundException);
	});

	it('updates the description fields, leaving vbId, wallet and organization untouched', async () => {
		const application = await createApplication();
		const updated = await service.updateApplication(application.id, { name: 'renamed', description: 'new' });
		expect(updated.name).toBe('renamed');
		expect(updated.description).toBe('new');
		expect(updated.vbId).toBe(application.vbId);
	});

	it('throws when updating an application that does not exist', async () => {
		await expect(service.updateApplication(9999, { name: 'x' })).rejects.toThrow(NotFoundException);
	});

	it('deletes an application with no dependents', async () => {
		const application = await createApplication();
		await service.deleteApplication(application.id);
		const reloaded = await dataSource.getRepository(ApplicationEntity).findOneBy({ id: application.id });
		expect(reloaded).toBeNull();
	});

	it('refuses to delete an application that still has an API key attached', async () => {
		const application = await createApplication();
		const apiKeyRepository = dataSource.getRepository(ApiKeyEntity);
		await apiKeyRepository.save(apiKeyRepository.create({ name: 'key', apiKey: 'cmts:1:secret', application }));

		await expect(service.deleteApplication(application.id)).rejects.toThrow(ConflictException);
	});

	it('refuses to delete an application that still has anchor request history', async () => {
		const application = await createApplication();
		const anchorRepository = dataSource.getRepository(AnchorRequestEntity);
		await anchorRepository.save(
			anchorRepository.create({ anchorRequestId: 'ar-1', application, receivedAnchorRequest: {} as any }),
		);

		await expect(service.deleteApplication(application.id)).rejects.toThrow(ConflictException);
	});
});
