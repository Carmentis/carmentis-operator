import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { WalletCrypto, SeedEncoder, SignatureSchemeId, JwkPrivateSignatureKey } from '@cmts-dev/carmentis-sdk-core';
import { WalletEntity } from '../entities/WalletEntity';
import { PrivateKeyEntity } from '../entities/PrivateKeyEntity';
import { PrivateKeyObjectType } from '../types/types';
import { PrivateKeyService } from './PrivateKeyService';
import { Bip39Utils } from '../utils/Bip39Utils';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { ApiKeyEntity } from '../entities/ApiKeyEntity';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';
import { WalletService } from './WalletService';
import { EncryptionServiceProxy } from '../shared/transformers/EncryptionServiceProxy';

// WalletEntity.actorPassphrase is an @EncryptedColumn(), whose transformer reads
// EncryptionServiceProxy.instance. In the real app that's set once from
// AppModule.onModuleInit(); here we just need any encrypt/decrypt pair so
// persisting a WalletEntity in these tests doesn't throw.
EncryptionServiceProxy.setInstance({
	encrypt: (value: string) => `enc:${value}`,
	decrypt: (value: string) => value.replace(/^enc:/, ''),
} as any);

const VALID_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

describe('WalletService', () => {
	let dataSource: DataSource;
	let service: WalletService;

	async function createWallet(overrides: Partial<WalletEntity> = {}): Promise<WalletEntity> {
		const repository = dataSource.getRepository(WalletEntity);
		const privateKey = await dataSource.getRepository(PrivateKeyEntity).save({
			privateKey: { keyType: PrivateKeyObjectType.SEED, schemeId: 0, seed: 'seed-value' },
		});
		return repository.save(
			repository.create({
				name: 'wallet-1',
				actorPassphrase: 'passphrase',
				privateKey,
				rpcEndpoint: 'https://rpc.example',
				indexerEndpoint: 'https://indexer.example',
				...overrides,
			}),
		);
	}

	beforeEach(async () => {
		dataSource = new DataSource({
			type: 'sqlite',
			database: ':memory:',
			synchronize: true,
			entities: [WalletEntity, PrivateKeyEntity, ApplicationEntity, ApiKeyEntity, AnchorRequestEntity],
		});
		await dataSource.initialize();
		service = new WalletService(dataSource.getRepository(WalletEntity), new PrivateKeyService());
	});

	afterEach(async () => {
		await dataSource.destroy();
	});

	it('generates a seed that can be decoded back into a WalletCrypto instance', () => {
		const seed = service.generateSeed();
		expect(typeof seed).toBe('string');
		const decoded = new SeedEncoder().decode(seed);
		expect(() => WalletCrypto.fromSeed(decoded)).not.toThrow();
	});

	it('generates distinct, valid BIP39 actor passphrases', () => {
		const first = service.generateActorPassphrase();
		expect(first.split(' ')).toHaveLength(24);
		expect(Bip39Utils.isValid(first)).toBe(true);
		expect(service.generateActorPassphrase()).not.toBe(first);
	});

	it.each(['', 'not a mnemonic', 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon'])(
		'rejects the invalid actor passphrase "%s" and persists nothing',
		async (actorPassphrase) => {
			await expect(
				service.createWallet({
					...baseDto,
					actorPassphrase,
					privateKey: { keyType: PrivateKeyObjectType.SEED, schemeId: SignatureSchemeId.SECP256K1, seed: service.generateSeed() },
				}),
			).rejects.toThrow(BadRequestException);
			expect(await dataSource.getRepository(WalletEntity).count()).toBe(0);
			expect(await dataSource.getRepository(PrivateKeyEntity).count()).toBe(0);
		},
	);

	const baseDto = {
		name: 'created',
		rpcEndpoint: 'https://rpc.example',
		indexerEndpoint: 'https://indexer.example',
		actorPassphrase: VALID_MNEMONIC,
	};

	it('creates a wallet from a seed-based private key, storing the normalized mnemonic', async () => {
		const wallet = await service.createWallet({
			...baseDto,
			actorPassphrase: `  ${VALID_MNEMONIC.toUpperCase().replace(/ /g, '   ')}\n`,
			privateKey: { keyType: PrivateKeyObjectType.SEED, schemeId: SignatureSchemeId.SECP256K1, seed: service.generateSeed() },
		});

		const stored = await dataSource.getRepository(WalletEntity).findOneOrFail({
			where: { id: wallet.id },
			relations: ['privateKey'],
		});
		expect(stored.actorPassphrase).toBe(VALID_MNEMONIC);
		expect(stored.privateKey.privateKey.keyType).toBe(PrivateKeyObjectType.SEED);
		await expect(service.getPublicKeyOfWallet(wallet.id)).resolves.toBeDefined();
	});

	it('creates a wallet from a JWK private key', async () => {
		const jwk = (await JwkPrivateSignatureKey.gen()).getPrivateJwk();
		const wallet = await service.createWallet({
			...baseDto,
			privateKey: { keyType: PrivateKeyObjectType.JWK, jwk },
		});
		await expect(service.getPublicKeyOfWallet(wallet.id)).resolves.toBeDefined();
	});

	it('lets several wallets share one private key entity', async () => {
		const first = await createWallet({ name: 'a' });
		const second = await createWallet({ name: 'b', privateKey: (await service.getPrivateKeyEntityOfWallet(first.id)) });
		const keyOfSecond = await dataSource.getRepository(WalletEntity).findOneOrFail({
			where: { id: second.id },
			relations: ['privateKey'],
		});
		expect(keyOfSecond.privateKey.id).toBe((await service.getPrivateKeyEntityOfWallet(first.id)).id);
	});

	it('rejects an unusable private key and persists nothing', async () => {
		await expect(
			service.createWallet({
				...baseDto,
				privateKey: { keyType: PrivateKeyObjectType.JWK, jwk: { kty: 'EC' } },
			}),
		).rejects.toThrow(BadRequestException);
		await expect(
			service.createWallet({ ...baseDto, privateKey: { keyType: 'NOPE' } }),
		).rejects.toThrow(BadRequestException);
		expect(await dataSource.getRepository(WalletEntity).count()).toBe(0);
		expect(await dataSource.getRepository(PrivateKeyEntity).count()).toBe(0);
	});

	it('updates only the fields provided, leaving the rest untouched (regression for the silent-reset bug)', async () => {
		const wallet = await createWallet({ name: 'original', allowedEndpointsRegex: '^/api/.*' });

		const updated = await service.updateWallet(wallet.id, { name: 'renamed' });

		expect(updated.name).toBe('renamed');
		expect(updated.rpcEndpoint).toBe('https://rpc.example');
		expect(updated.allowedEndpointsRegex).toBe('^/api/.*');
		expect(updated.actorSignatureSchemeId).toBe(wallet.actorSignatureSchemeId);
	});

	it('throws when updating a wallet that does not exist', async () => {
		await expect(service.updateWallet(999, { name: 'x' })).rejects.toThrow(NotFoundException);
	});

	it('deletes a wallet with no dependents', async () => {
		const wallet = await createWallet();
		await service.deleteWallet(wallet.id);
		const reloaded = await dataSource.getRepository(WalletEntity).findOneBy({ id: wallet.id });
		expect(reloaded).toBeNull();
	});

	it('refuses to delete a wallet that still has an application attached', async () => {
		const wallet = await createWallet();
		const applicationRepository = dataSource.getRepository(ApplicationEntity);
		await applicationRepository.save(applicationRepository.create({ vbId: 'aa', name: 'app', wallet }));

		await expect(service.deleteWallet(wallet.id)).rejects.toThrow(ConflictException);
		const stillThere = await dataSource.getRepository(WalletEntity).findOneBy({ id: wallet.id });
		expect(stillThere).not.toBeNull();
	});

	it('refuses to delete a wallet that still has a directly-linked API key', async () => {
		const wallet = await createWallet();
		const apiKeyRepository = dataSource.getRepository(ApiKeyEntity);
		await apiKeyRepository.save(apiKeyRepository.create({ name: 'key', apiKey: 'cmts:1:secret', wallet }));

		await expect(service.deleteWallet(wallet.id)).rejects.toThrow(ConflictException);
	});

	it('reports accurate dependent counts', async () => {
		const wallet = await createWallet();
		const applicationRepository = dataSource.getRepository(ApplicationEntity);
		await applicationRepository.save(applicationRepository.create({ vbId: 'aa', name: 'app', wallet }));
		const apiKeyRepository = dataSource.getRepository(ApiKeyEntity);
		await apiKeyRepository.save(apiKeyRepository.create({ name: 'key', apiKey: 'cmts:1:secret', wallet }));

		const counts = await service.countDependents(wallet.id);
		expect(counts).toEqual({ applications: 1, apiKeys: 1 });
	});
});
