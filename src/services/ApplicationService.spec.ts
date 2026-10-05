import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WalletEntity } from '../entities/WalletEntity';
import { PrivateKeyEntity } from '../entities/PrivateKeyEntity';
import { PrivateKeyObjectType } from '../types/types';
import { ApplicationEntity } from '../entities/ApplicationEntity';
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

	beforeEach(async () => {
		dataSource = new DataSource({
			type: 'sqlite',
			database: ':memory:',
			synchronize: true,
			entities: [WalletEntity, PrivateKeyEntity, ApplicationEntity, ApiKeyEntity, AnchorRequestEntity],
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

		service = new ApplicationService(dataSource.getRepository(ApplicationEntity));
	});

	afterEach(async () => {
		await dataSource.destroy();
	});

	async function createApplication(vbId = 'aa'): Promise<ApplicationEntity> {
		const repository = dataSource.getRepository(ApplicationEntity);
		return repository.save(repository.create({ vbId, name: 'app', wallet }));
	}

	it('updates only the name, leaving vbId and wallet untouched', async () => {
		const application = await createApplication();
		const updated = await service.updateApplication(application.vbId, { name: 'renamed' });
		expect(updated.name).toBe('renamed');
		expect(updated.vbId).toBe(application.vbId);
	});

	it('throws when updating an application that does not exist', async () => {
		await expect(service.updateApplication('does-not-exist', { name: 'x' })).rejects.toThrow(NotFoundException);
	});

	it('deletes an application with no dependents', async () => {
		const application = await createApplication();
		await service.deleteApplication(application.vbId);
		const reloaded = await dataSource.getRepository(ApplicationEntity).findOneBy({ vbId: application.vbId });
		expect(reloaded).toBeNull();
	});

	it('refuses to delete an application that still has an API key attached', async () => {
		const application = await createApplication();
		const apiKeyRepository = dataSource.getRepository(ApiKeyEntity);
		await apiKeyRepository.save(apiKeyRepository.create({ name: 'key', apiKey: 'cmts:1:secret', application }));

		await expect(service.deleteApplication(application.vbId)).rejects.toThrow(ConflictException);
	});

	it('refuses to delete an application that still has anchor request history', async () => {
		const application = await createApplication();
		const anchorRepository = dataSource.getRepository(AnchorRequestEntity);
		await anchorRepository.save(
			anchorRepository.create({ anchorRequestId: 'ar-1', application, receivedAnchorRequest: {} as any }),
		);

		await expect(service.deleteApplication(application.vbId)).rejects.toThrow(ConflictException);
	});
});
