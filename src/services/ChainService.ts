import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
	ApplicationDescriptionSection, BalanceAvailability,
	CMTSToken,
	CryptoEncoderFactory, FeesCalculationFormulaFactory,
	Hash,
	Microblock, OrganizationVb,
	Provider,
	ProviderFactory,
	PublicSignatureKey,
	Section,
	SectionType,
	SignatureSchemeId, Utils,
	ValidatorNodeCometbftPublicKeyDeclarationSection, ValidatorNodeCreationSection, ValidatorNodeRpcEndpointSection,
	ValidatorNodeVb,
	VirtualBlockchainType,
} from '@cmts-dev/carmentis-sdk/server';
import { OperatorConfigService } from '../config/services/operator-config.service';
import { createCache, Cache } from 'cache-manager';
import { WalletEntity } from '../entities/WalletEntity';


function MyCache(keyPrefix: string, ttl: number = 10000) {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			// Récupérer l'instance du cache depuis 'this'
			const cache: Cache = (this as any).cache;

			if (!cache) {
				// Si pas de cache disponible, exécuter la méthode normalement
				return originalMethod.apply(this, args);
			}

			// Créer une clé unique basée sur le préfixe et les arguments
			const cacheKey = `${keyPrefix}-${JSON.stringify(args)}`;

			return cache.wrap(
				cacheKey,
				async () => originalMethod.apply(this, args),
				{ ttl }
			);
		};

		return descriptor;
	};
}

/**
 * ChainService is a service class designed to handle functionalities
 * related to managing and operating on chains of data or operations.
 *
 * This class is intended to provide utility methods for processing,
 * manipulating, or interacting with chains. It includes no initial
 * state or properties by default.
 *
 * The specific roles and methods intended for this service should
 * be defined and implemented as per the application requirements.
 */
@Injectable()
export default class ChainService {

	private logger: Logger;
	private cache: Cache;
	constructor(
		private readonly config: OperatorConfigService
	) {
		this.logger = new Logger(ChainService.name);
		this.cache = createCache();
	}


	async getBreakdownOfAccountByVbId(wallet: WalletEntity, vbId: string) {
		const provider = wallet.getProvider();
		const accountState = await provider.getAccountState(Hash.fromHex(vbId).toBytes())
		return BalanceAvailability.createFromAccountStateAbciResponse(accountState)
	}

	/**
	 * Since a microblock does not change, the memory cache can be extended.
	 * @param hash
	 */
	async getMicroblockByHash(wallet: WalletEntity, hash: Hash) {
		const provider = wallet.getProvider();
		return provider.loadMicroblockByMicroblockHash(hash);
	}
}