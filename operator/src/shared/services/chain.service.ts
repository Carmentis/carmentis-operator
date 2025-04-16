import { Injectable, Logger, NotFoundException, OnModuleInit, UnprocessableEntityException } from '@nestjs/common';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
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
export default class ChainService implements OnModuleInit{

	private logger = new Logger(ChainService.name);
	constructor() {}

	onModuleInit() {
		this.logger.log(`Linking operator with node located at ${process.env.NODE_URL}`)
		sdk.blockchain.blockchainCore.setNode(process.env.NODE_URL);
	}

	async publishOrganisation(
		organisation: OrganisationEntity
	)  {

		// reject if the country code or city are undefined
		const countryCode = organisation.countryCode;
		const city = organisation.city;
		if (typeof countryCode !== 'string' || countryCode.trim().length === 0) {
			throw "Empty country code."
		}
		if (typeof city !== 'string' || city.trim().length === 0) {
			throw "Empty city.";
		}

		// initialise the blockchain sdk
		sdk.blockchain.blockchainCore.setUser(
			sdk.blockchain.ROLES.OPERATOR,
			organisation.privateSignatureKey
		);


		const organisationVb = new sdk.blockchain.organizationVb(organisation.virtualBlockchainId)

		// if the organisation has already been published, load the existing block
		if ( organisation.virtualBlockchainId ) {
			this.logger.debug("Loading existing organisation block", organisation);
			await organisationVb.load();
		} else {
			this.logger.debug("Creating new organisation block");
			// set the organisation public signature key
			await organisationVb.addPublicKey({
				publicKey: organisation.publicSignatureKey
			});

			organisationVb.setGasPrice(
				sdk.constants.ECO.TOKEN
			);
		}


		// add the organisation description
		await organisationVb.addDescription({
			name: organisation.name,
			city: organisation.city,
			countryCode: organisation.countryCode,
			website: organisation.website
		});

		// sign the organisation
		await organisationVb.sign()

		// publish the micro-block
		return await organisationVb.publish();


	}

	/**
	 * Publishes an application to the blockchain.
	 *
	 * @param organisation The organisation to publish the application under.
	 * @param application The application to publish.
	 */
	async publishApplication(
		organisation: OrganisationEntity,
		application: ApplicationEntity
	) {
		// initialise the blockchain sdk
		sdk.blockchain.blockchainCore.setUser(
			sdk.blockchain.ROLES.OPERATOR,
			organisation.privateSignatureKey
		);

		const vc = new sdk.blockchain.applicationVb(application.virtualBlockchainId);
		if ( !application.virtualBlockchainId ) {
			await vc.addDeclaration({
				organizationId: organisation.virtualBlockchainId,
			});

		} else {
			await vc.load();
		}

		await vc.addDescription( {
			name: application.name,
			logoUrl: application.logoUrl || '',
			homepageUrl: application.website || '',
			rootDomain: application.domain || '',
			description: application.description
		})

		await vc.addDefinition({
			version: application.version + 1, // we increment the version number
		});

		vc.setGasPrice(
			sdk.constants.ECO.TOKEN
		);


		await vc.sign();
		return vc.publish()
	}

	async checkAccountExistence(publicSignatureKey: string) {
		try {
			this.logger.log(`Checking existence of token account from public key: '${publicSignatureKey}'`)
			await sdk.blockchain.blockchainQuery.getAccountByPublicKey(publicSignatureKey);
			return true;
		} catch (e) {
			this.logger.log('Organisation token account not found');
			return false;
		}
	}


	async getTransactionsHistory(publicSignatureKey, fromHistoryHash: string | undefined, limit: number) {
		try {
			const accountHash = await sdk.blockchain.blockchainQuery.getAccountByPublicKey(publicSignatureKey);
			if (!accountHash) throw new NotFoundException('No account found');

			const accountState = await sdk.blockchain.blockchainQuery.getAccountState(accountHash);
			return await sdk.blockchain.blockchainQuery.getAccountHistory(
				accountHash,
				fromHistoryHash || accountState.lastHistoryHash,
				limit
			);

		} catch (e) {
			this.logger.log("Cannot produce history of transactions:", e);
			throw new UnprocessableEntityException(e)
		}

	}

	async getBalanceOfAccount(publicSignatureKey: string) {
		try {
			const accountHash = await sdk.blockchain.blockchainQuery.getAccountByPublicKey(publicSignatureKey);
			if (!accountHash) throw new NotFoundException('No account found');

			const accountState = await sdk.blockchain.blockchainQuery.getAccountState(accountHash);
			return accountState.balance
		} catch (e) {
			throw new UnprocessableEntityException(e)
		}
	}

	async checkPublishedOnChain(organisation: OrganisationEntity) {
		try {
			const response = await sdk.blockchain.blockchainQuery.getVirtualBlockchainInfo(organisation.virtualBlockchainId)
			return response !== undefined
		} catch (e) {
			return false;
		}
	}
}