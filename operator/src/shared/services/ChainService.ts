import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import {
	ApplicationPublicationExecutionContext,
	Blockchain, BlockchainFacade,
	Explorer,
	Hash, OrganizationPublicationExecutionContext,
	ProviderFactory,
	PublicSignatureKey,
	StringSignatureEncoder,
	TOKEN,
} from '@cmts-dev/carmentis-sdk/server';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { OrganisationEntity } from '../entities/OrganisationEntity';


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
	private nodeUrl: string;
	private blockchain : BlockchainFacade;
	constructor() {
		this.logger = new Logger(ChainService.name);
		this.logger.log(`Linking operator with node located at ${process.env.NODE_URL}`)
		this.nodeUrl = process.env.NODE_URL;
		this.blockchain = BlockchainFacade.createFromNodeUrl(this.nodeUrl);
	}


	async publishOrganisation(
		organisationEntity: OrganisationEntity
	)  {
		this.logger.log(`Publishing organisation ${organisationEntity.name}`)
		// reject if the country code or city are undefined
		const countryCode = organisationEntity.countryCode;
		const city = organisationEntity.city;
		if (typeof countryCode !== 'string' || countryCode.trim().length === 0) {
			throw "Empty country code."
		}
		if (typeof city !== 'string' || city.trim().length === 0) {
			throw "Empty city.";
		}


		// load organisation key pair
		const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		const organisationPrivateKey = signatureEncoder.decodePrivateKey(organisationEntity.privateSignatureKey);



		// create or update the application
		const isAlreadyPublished = organisationEntity.published;
		const organisationId = organisationEntity.virtualBlockchainId;
		const publicationContext = new OrganizationPublicationExecutionContext()
			.withCity(organisationEntity.city)
			.withName(organisationEntity.name)
			.withWebsite(organisationEntity.website)
			.withCountryCode(organisationEntity.countryCode);

		if (isAlreadyPublished) {
			publicationContext.withExistingOrganizationId(Hash.from(organisationId))
		}

		const blockchain = BlockchainFacade.createFromNodeUrlAndPrivateKey(this.nodeUrl, organisationPrivateKey);
		return blockchain.publishOrganization(publicationContext);
	}

	/**
	 * Publishes an application to the blockchain.
	 *
	 * @param organisation The organisation to publish the application under.
	 * @param applicationEntity The application to publish.
	 */
	async publishApplication(
		organisation: OrganisationEntity,
		applicationEntity: ApplicationEntity
	): Promise<Hash> {

		// load the organisation key pair and application id
		const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		const organisationPrivateKey = signatureEncoder.decodePrivateKey(organisation.privateSignatureKey);
		const applicationId = applicationEntity.virtualBlockchainId;
		const isAlreadyPublished = applicationEntity.published;


		// create or update the application
		const publicationContext = new ApplicationPublicationExecutionContext()
			.withApplicationName(applicationEntity.name)
			.withApplicationDescription(applicationEntity.description);
		if (isAlreadyPublished) {
			publicationContext.withExistingApplicationId(Hash.from(applicationId))
		} else {
			publicationContext.withOrganizationId(Hash.from(organisation.virtualBlockchainId));
		}
		const blockchain = BlockchainFacade.createFromNodeUrlAndPrivateKey(this.nodeUrl, organisationPrivateKey);
		return blockchain.publishApplication(publicationContext);
	}

	async checkAccountExistence(publicSignatureKey: PublicSignatureKey) {
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(this.nodeUrl);
		const blockchain = Explorer.createFromProvider(provider);
		try {
			this.logger.log(`Checking existence of token account from public key: '${publicSignatureKey}'`)
			await blockchain.getAccountByPublicKey(publicSignatureKey);
			return true;
		} catch (e) {
			this.logger.log('Organisation token account not found');
			return false;
		}
	}


	async getTransactionsHistory(publicSignatureKey: PublicSignatureKey, fromHistoryHash: string | undefined, limit: number) {
		return this.blockchain.getAccountHistoryFromPublicKey(publicSignatureKey);
		/*
		const explorer = Explorer.createFromProvider(
			ProviderFactory.createInMemoryProviderWithExternalProvider(this.nodeUrl),
		);
		try {
			const accountHash = await explorer.getAccountByPublicKey(publicSignatureKey);
			if (!accountHash) throw new NotFoundException('No account found');

			const accountState = await explorer.getAccountState(accountHash);
			return await explorer.getAccountHistory(
				accountHash,
				Hash.from(fromHistoryHash || accountState.lastHistoryHash),
				limit
			);

		} catch (e) {
			this.logger.log("Cannot produce history of transactions:", e);
			throw new UnprocessableEntityException(e)
		}

		 */

	}

	async getBalanceOfAccount(publicSignatureKey: PublicSignatureKey) {
		return this.blockchain.getAccountBalanceFromPublicKey(publicSignatureKey);
	}

	async checkPublishedOnChain(organisation: OrganisationEntity) {
		// if the organisation do not have virtual blockchain id, it has not been published
		if (!organisation.virtualBlockchainId) return false;

		// otherwise, check if the organisation is published on the blockchain
		try {
			const blockchain = Blockchain.createFromProvider(
				ProviderFactory.createInMemoryProviderWithExternalProvider(this.nodeUrl)
			);
			await blockchain.loadOrganization(
				Hash.from(organisation.virtualBlockchainId)
			);
			return true;
		} catch (e) {
			return false;
		}
	}


}