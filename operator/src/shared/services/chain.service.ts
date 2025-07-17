import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import {
	Blockchain,
	Explorer,
	Hash,
	ProviderFactory,
	PublicSignatureKey,
	StringSignatureEncoder,
	TOKEN,
} from '@cmts-dev/carmentis-sdk/server';
import { ApplicationEntity } from '../entities/application.entity';
import { OrganisationEntity } from '../entities/organisation.entity';


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
	private explorer: Explorer;
	constructor() {
		this.logger = new Logger(ChainService.name);
		this.logger.log(`Linking operator with node located at ${process.env.NODE_URL}`)
		this.nodeUrl = process.env.NODE_URL;
		this.explorer =  Explorer.createFromProvider(
			ProviderFactory.createInMemoryProviderWithExternalProvider(this.nodeUrl)
		);
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

		// load the blockchain and provider
		const provider = ProviderFactory.createKeyedProviderExternalProvider(organisationPrivateKey, this.nodeUrl);
		const blockchain = Blockchain.createFromProvider(provider);

		const organisationId = organisationEntity.virtualBlockchainId;
		const organisation = organisationId ?
			await blockchain.loadOrganization(Hash.from(organisationId)) :
			await blockchain.createOrganization();

		await organisation.setDescription({
			name: organisationEntity.name,
			city: organisationEntity.city,
			countryCode: organisationEntity.countryCode,
			website: organisationEntity.website
		});

		return await organisation.publishUpdates();


		/*
		const organisationVb = new OrganizationVb({provider});
		const organisationId = organisation.virtualBlockchainId;
		//const organisationVb = new sdk.blockchain.organizationVb(organisation.virtualBlockchainId)

		// if the organisation has already been published, load the existing block
		if ( organisation.virtualBlockchainId ) {
			this.logger.debug("Loading existing organisation block", organisation);
			await organisationVb.load(organisationId);
		} else {
			this.logger.debug("Creating new organisation block");
			// set the organisation public signature key
			await organisationVb.setPublicKey(organisationPublicKey);

			organisationVb.setGasPrice(
				TOKEN
			);
		}


		// add the organisation description
		await organisationVb.setDescription({
			name: organisation.name,
			city: organisation.city,
			countryCode: organisation.countryCode,
			website: organisation.website
		});

		// sign the organisation
		await organisationVb.setSignature( organisationPrivateKey );

		// publish the micro-block
		return await organisationVb.publish();

		 */


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

		// load the organisation key pair
		const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		const organisationPrivateKey = signatureEncoder.decodePrivateKey(organisation.privateSignatureKey);

		// load the application
		const provider = ProviderFactory.createKeyedProviderExternalProvider(organisationPrivateKey, this.nodeUrl);
		const blockchain = Blockchain.createFromProvider(provider);
		const applicationId = applicationEntity.virtualBlockchainId;
		const application = applicationId ?
			await blockchain.loadApplication(Hash.from(applicationId)) :
			await blockchain.createApplication(Hash.from(organisation.virtualBlockchainId));

		// set the description of the application
		await application.setDescription({
			name: applicationEntity.name,
			logoUrl: applicationEntity.logoUrl || '',
			homepageUrl: applicationEntity.website || '',
			description: applicationEntity.description
		})

		// set the gas prixe
		application.setGasPrice(TOKEN);

		// publish
		return await application.publishUpdates();
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

	}

	async getBalanceOfAccount(publicSignatureKey: PublicSignatureKey) {
		try {

			const accountHash = await this.explorer.getAccountByPublicKey(publicSignatureKey);
			if (!accountHash) throw new NotFoundException('No account found');

			const accountState = await this.explorer.getAccountState(accountHash);
			return accountState.balance
		} catch (e) {
			throw new UnprocessableEntityException(e)
		}
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