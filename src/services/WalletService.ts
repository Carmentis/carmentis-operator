import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from '../entities/WalletEntity';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { OrganizationEntity } from '../entities/OrganizationEntity';
import { ApiKeyEntity } from '../entities/ApiKeyEntity';
import {
	BytesToHexEncoder,
	CMTSToken,
	CryptoEncoderFactory,
	ExternalKeyApplicationLedgerActorIdentity,
	Hash,
	SeedEncoder,
	VirtualBlockchainType,
	WalletCrypto,
} from '@cmts-dev/carmentis-sdk-core';
import { WalletUpdateDto } from '../dto/admin/WalletUpdateDto';
import { PrivateKeyUtils } from '../utils/PrivateKeyUtils';
import { Bip39Utils } from '../utils/Bip39Utils';
import { PrivateKeyService } from './PrivateKeyService';
import { PrivateKeyEntity } from '../entities/PrivateKeyEntity';
import { WalletCreationDto } from '../dto/wallet/WalletCreationDto';

export interface ApplicationOnChainDetails {
	application: { name: string; description: string; homepageUrl: string; logoUrl: string };
	organization: { id: string; name?: string; website?: string; city?: string; countryCode?: string };
	organizationError?: string;
}

export type AccountStatus =
	| { attached: false }
	| { attached: true; accountId: string; balance: string };

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

	/**
	 * Non-secret facts about the key of a wallet, for display: its type and its public key.
	 * The public key is `null` when it cannot be derived.
	 */
	async getKeyDetails(walletId: number): Promise<{ keyType: string; publicKey: string | null }> {
		const privateKeyEntity = await this.getPrivateKeyEntityOfWallet(walletId);
		const keyType = privateKeyEntity.privateKey.keyType;
		try {
			const publicKey = await this.getPublicKeyOfWallet(walletId);
			return { keyType, publicKey: await CryptoEncoderFactory.defaultStringSignatureEncoder().encodePublicKey(publicKey) };
		} catch {
			return { keyType, publicKey: null };
		}
	}

	/**
	 * Looks up, through the provider of the wallet (its RPC endpoint), the on-chain account
	 * owning the wallet's public key and its balance, formatted as a CMTS amount.
	 *
	 * @throws If the node cannot be reached or does not know the account.
	 */
	async getOnChainAccount(wallet: WalletEntity): Promise<{ accountId: string; balance: string }> {
		const provider = wallet.getProvider();
		const publicKey = await this.getPublicKeyOfWallet(wallet.id);
		const accountId = await provider.getAccountIdFromPublicKey(publicKey);
		const state = await provider.getAccountState(accountId.toBytes());
		return {
			accountId: accountId.encode(new BytesToHexEncoder()),
			balance: CMTSToken.createAtomic(state.balance).toString(),
		};
	}

	/**
	 * Tells whether the wallet is attached to an on-chain account, which is required to
	 * publish anything (the account pays the fees). A wallet whose key is unknown to the
	 * network is simply "not attached": only local creation is possible for it.
	 *
	 * @throws If the node cannot be reached or fails for any other reason, so that an outage is
	 * never mistaken for a missing account.
	 */
	async getAccountStatus(wallet: WalletEntity): Promise<AccountStatus> {
		try {
			return { attached: true, ...(await this.getOnChainAccount(wallet)) };
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			if (/unknown account/i.test(reason)) {
				return { attached: false };
			}
			throw error;
		}
	}

	/**
	 * Checks, through the provider of the wallet (its RPC endpoint), that the given virtual
	 * blockchain exists on-chain and is an application, and returns the name it was given
	 * on-chain.
	 *
	 * @throws BadRequestException If the identifier is malformed, the virtual blockchain is
	 * unknown to the network, is not an application, or the network cannot be queried.
	 */
	async fetchApplicationNameFromChain(wallet: WalletEntity, vbId: string): Promise<string> {
		const provider = wallet.getProvider();
		let state;
		try {
			state = await provider.getVirtualBlockchainStatus(Hash.fromHex(vbId).toBytes());
		} catch (error) {
			throw this.chainLookupFailure(wallet, vbId, error);
		}
		if (!state) {
			throw new BadRequestException(
				`No virtual blockchain ${vbId} exists on ${wallet.rpcEndpoint}: the application must exist on-chain before being imported`,
			);
		}
		if (state.type !== VirtualBlockchainType.APPLICATION_VIRTUAL_BLOCKCHAIN) {
			throw new BadRequestException(`The virtual blockchain ${vbId} exists on-chain but is not an application`);
		}

		try {
			const applicationVb = await provider.loadApplicationVirtualBlockchain(Hash.fromHex(vbId));
			const description = await applicationVb.getApplicationDescription();
			return description.name;
		} catch (error) {
			throw this.chainLookupFailure(wallet, vbId, error);
		}
	}

	/**
	 * Reads, through the provider of the wallet (its RPC endpoint), the on-chain description of
	 * an application and of the organization owning it.
	 *
	 * The organization is looked up separately: if only that part fails, the application is
	 * still returned along with `organizationError`.
	 *
	 * @throws BadRequestException If the application itself cannot be read.
	 */
	async getApplicationOnChainDetails(wallet: WalletEntity, vbId: string): Promise<ApplicationOnChainDetails> {
		const provider = wallet.getProvider();
		let applicationVb;
		let application;
		try {
			applicationVb = await provider.loadApplicationVirtualBlockchain(Hash.fromHex(vbId));
			const description = await applicationVb.getApplicationDescription();
			application = {
				name: description.name,
				description: description.description,
				homepageUrl: description.homepageUrl,
				logoUrl: description.logoUrl,
			};
		} catch (error) {
			throw this.chainLookupFailure(wallet, vbId, error);
		}

		const organizationId = applicationVb.getOrganizationId();
		const organizationIdHex = organizationId.encode(new BytesToHexEncoder());
		try {
			const organizationVb = await provider.loadOrganizationVirtualBlockchain(organizationId);
			const description = await organizationVb.getDescription();
			return {
				application,
				organization: {
					id: organizationIdHex,
					name: description.name,
					website: description.website,
					city: description.city,
					countryCode: description.countryCode,
				},
			};
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			return { application, organization: { id: organizationIdHex }, organizationError: reason };
		}
	}

	private chainLookupFailure(wallet: WalletEntity, vbId: string, error: unknown) {
		const reason = error instanceof Error ? error.message : String(error);
		return new BadRequestException(`Could not verify the application ${vbId} on ${wallet.rpcEndpoint}: ${reason}`);
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

	async countDependents(id: number): Promise<{ organizations: number; applications: number; apiKeys: number }> {
		const [organizations, applications, apiKeys] = await Promise.all([
			OrganizationEntity.count({ where: { wallet: { id } } }),
			ApplicationEntity.count({ where: { wallet: { id } } }),
			ApiKeyEntity.count({ where: { wallet: { id } } }),
		]);
		return { organizations, applications, apiKeys };
	}

	/** Refuses to delete a wallet that still has applications or API keys attached, rather
	 * than silently letting the DB's `onDelete: CASCADE` wipe them out. */
	async deleteWallet(id: number): Promise<void> {
		const wallet = await this.repo.findOneBy({ id });
		if (!wallet) {
			throw new NotFoundException('Wallet not found');
		}
		const { organizations, applications, apiKeys } = await this.countDependents(id);
		if (organizations > 0 || applications > 0 || apiKeys > 0) {
			throw new ConflictException(
				`Cannot delete this wallet: ${organizations} organization(s), ${applications} application(s) and ${apiKeys} API key(s) still depend on it. Delete or reassign them first.`,
			);
		}
		await this.repo.delete(id);
	}
}
