import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from '../entities/WalletEntity';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { ApiKeyEntity } from '../entities/ApiKeyEntity';
import { ExternalKeyApplicationLedgerActorIdentity, SeedEncoder, WalletCrypto } from '@cmts-dev/carmentis-sdk-core';
import { WalletUpdateDto } from '../dto/admin/WalletUpdateDto';
import { PrivateKeyUtils } from '../utils/PrivateKeyUtils';
import { Bip39Utils } from '../utils/Bip39Utils';
import { PrivateKeyService } from './PrivateKeyService';
import { PrivateKeyEntity } from '../entities/PrivateKeyEntity';
import { WalletCreationDto } from '../dto/wallet/WalletCreationDto';

@Injectable()
export class WalletService {
	constructor(
		@InjectRepository(WalletEntity)
		private readonly repo: Repository<WalletEntity>,
		private readonly privateKeyService: PrivateKeyService,
	) {}

	async findAll(): Promise<WalletEntity[]> {
		return this.repo.find();
	}

	/**
	 * Creates a wallet together with its private key.
	 *
	 * The private key is validated (a sample message is signed and verified) before anything
	 * is written, and the key and the wallet are persisted atomically.
	 */
	async createWallet(dto: WalletCreationDto): Promise<WalletEntity> {
		if (!Bip39Utils.isValid(dto.actorPassphrase)) {
			throw new BadRequestException(
				'The actor passphrase must be a valid BIP39 mnemonic (English word list, correct checksum)',
			);
		}
		const actorPassphrase = Bip39Utils.normalize(dto.actorPassphrase);
		const privateKey = await this.privateKeyService.parseAndValidate(dto.privateKey);
		return this.repo.manager.transaction(async manager => {
			const privateKeyEntity = await manager.save(PrivateKeyEntity.create({ privateKey }));
			return manager.save(
				this.repo.create({
					name: dto.name,
					rpcEndpoint: dto.rpcEndpoint,
					indexerEndpoint: dto.indexerEndpoint,
					allowedEndpointsRegex: dto.allowedEndpointsRegex || undefined,
					actorPassphrase,
					privateKey: privateKeyEntity,
				}),
			);
		});
	}

	/**
	 * Returns the private key entity of a wallet.
	 * @param walletId
	 */
	async getPrivateKeyEntityOfWallet(walletId: number) {
		const wallet = await WalletEntity.findOne({
			where: {
				id: walletId,
			},
			relations: ["privateKey"]
		});
		return wallet.privateKey;
	}


	/**
	 * Returns the private key of a wallet.
	 * @param walletId
	 */
	async getPrivateKeyOfWallet(walletId: number) {
		const privateKeyEntity = await this.getPrivateKeyEntityOfWallet(walletId);
		const privateKey = privateKeyEntity.privateKey;
		return PrivateKeyUtils.getPrivateSignatureKeyFromPrivateKeyObject(privateKey)
	}

	/**
	 * Returns the public key of a wallet.
	 *
	 * @param walletId
	 */
	async getPublicKeyOfWallet(walletId: number) {
		const privateKey = await this.getPrivateKeyOfWallet(walletId);
		return privateKey.getPublicKey()
	}


	async getActorIdentity(wallet: number | WalletEntity, vbSeed: Uint8Array) {
		const walletId = typeof wallet === 'number' ? wallet : wallet.id;
		const organizationPrivateKey = await this.getPrivateKeyOfWallet(walletId);
		const organizationPublicKey = await organizationPrivateKey.getPublicKey();
		const actorPassphrase = await this.getActorPassphraseOfWallet(walletId)
		return await ExternalKeyApplicationLedgerActorIdentity.createFromPublicSignatureKeyAndMnemonic(
			organizationPublicKey,
			actorPassphrase,
			vbSeed,
		)
	}
	/**
	 * Returns the private key of a wallet.
	 * @param walletId
	 */
	async getActorPassphraseOfWallet(walletId: number) {
		const wallet = await WalletEntity.findOne({
			where: {
				id: walletId,
			},
		});
		return wallet.actorPassphrase;
	}

	async getOneById(id: number) {
		return this.repo.findOneBy({ id });
	}

	async getWalletByApplicationId(applicationId: string) {
		return this.repo.findOne({
			where: {
				applications: {
					vbId: applicationId,
				},
			}
		});
	}

	/** Generates a fresh, randomly-seeded wallet secret, encoded the same way it is decoded
	 * elsewhere (see `WalletUtils.getAccountCryptoFromWallet`, which decodes via `SeedEncoder`). */
	generateSeed(): string {
		return WalletCrypto.generateWallet().encode(new SeedEncoder());
	}

	/** Generates a fresh BIP39 mnemonic, proposed (and editable) as actor passphrase in the creation form. */
	generateActorPassphrase(): string {
		return Bip39Utils.generate();
	}

	/** Partial update: only the fields actually present in `dto` are changed, everything
	 * else (including `seed` and the crypto scheme ids, which aren't part of this DTO at
	 * all) is left untouched. */
	async updateWallet(id: number, dto: WalletUpdateDto): Promise<WalletEntity> {
		const wallet = await this.repo.findOneBy({ id });
		if (!wallet) {
			throw new NotFoundException('Wallet not found');
		}
		Object.assign(wallet, dto);
		return this.repo.save(wallet);
	}

	async countDependents(id: number): Promise<{ applications: number; apiKeys: number }> {
		const [applications, apiKeys] = await Promise.all([
			ApplicationEntity.count({ where: { wallet: { id } } }),
			ApiKeyEntity.count({ where: { wallet: { id } } }),
		]);
		return { applications, apiKeys };
	}

	/** Refuses to delete a wallet that still has applications or API keys attached, rather
	 * than silently letting the DB's `onDelete: CASCADE` wipe them out. */
	async deleteWallet(id: number): Promise<void> {
		const wallet = await this.repo.findOneBy({ id });
		if (!wallet) {
			throw new NotFoundException('Wallet not found');
		}
		const { applications, apiKeys } = await this.countDependents(id);
		if (applications > 0 || apiKeys > 0) {
			throw new ConflictException(
				`Cannot delete this wallet: ${applications} application(s) and ${apiKeys} API key(s) still depend on it. Delete or reassign them first.`,
			);
		}
		await this.repo.delete(id);
	}
}
