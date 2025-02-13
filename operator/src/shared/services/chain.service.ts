import {
	Injectable,
	InternalServerErrorException,
	Logger, NotFoundException,
	OnModuleInit, UnprocessableEntityException,
} from '@nestjs/common';
import * as sdk from "@cmts-dev/carmentis-sdk/server";
import { ApplicationEntity } from '../entities/application.entity';
import { OrganisationEntity } from '../entities/organisation.entity';
import { OracleEntity } from '../entities/oracle.entity';


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

	/**
	 * Publishes an organisation to the blockchain by creating or updating a micro-block with the organisation's details.
	 *
	 * @param {OrganisationEntity} organisation - The organisation entity containing details such as name, location, website, and keys.
	 * @return {Promise<MicroBlock>} A promise that resolves to the published micro-block of the organisation.
	 */
	async publishOrganisation(
		organisation: OrganisationEntity
	) : Promise<MicroBlock> {
		// initialise the blockchain sdk
		sdk.blockchain.blockchainCore.setUser(
			sdk.blockchain.ROLES.OPERATOR,
			organisation.privateSignatureKey
		);


		const organisationVb = new sdk.blockchain.organizationVb()

		// if the organisation has already been published, load the existing block
		if ( organisation.virtualBlockchainId ) {
			console.log("Loading existing organisation block", organisation);
			await organisationVb.load(organisation.virtualBlockchainId);
		} else {
			console.log("Creating new organisation block");
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
		try {
			return await organisationVb.publish();
		} catch (e) {
			console.error(e);
			throw new InternalServerErrorException("Failed to publish the organisation");
		}

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

		const vc = new sdk.blockchain.applicationVb();
		if ( !application.virtualBlockchainId ) {
			console.log("Creating new application", application, organisation);
			await vc.addDeclaration({
				organizationId: organisation.virtualBlockchainId,
			});

		} else {
			console.log("Loading existing application", application);
			await vc.load(application.virtualBlockchainId);
		}

		await vc.addDescription( {
			name: application.name,
			logoUrl: application.logoUrl || '',
			homepageUrl: application.website || '',
			rootDomain: application.domain || '',
			description: application.description
		})

		// merge the default empty application with the provided one
		await vc.addDefinition({
			version: application.version + 1, // we increment the version number
			definition: {
				fields: [],
				structures: [],
				masks: [],
				enumerations: [],
				messages: [],
				...application.data // replace default empty data with the application data if any
			}
		});

		vc.setGasPrice(
			sdk.constants.ECO.TOKEN
		);


		await vc.sign();

		return vc.publish()
	}


	async publishOracle(organisation: OrganisationEntity, oracle: OracleEntity) {
		// TODO remove the hardcoded node
		// initialise the blockchain sdk
		sdk.blockchain.blockchainCore.setUser(
			sdk.blockchain.ROLES.OPERATOR,
			organisation.privateSignatureKey
		);

		console.log('oracle publication:', organisation)
		const vc = new sdk.blockchain.oracleVb();
		if ( !oracle.virtualBlockchainId ) {
			await vc.addDeclaration({
				organizationId: organisation.virtualBlockchainId,
			});
		} else {
			await vc.load(oracle.virtualBlockchainId);
		}

		await vc.addDescription( {
			name: oracle.name,
			logoUrl: oracle.logoUrl || '',
			rootDomain: oracle.domain || '',
		})

		// merge the default empty application with the provided one
		await vc.addDefinition({
			version: oracle.version + 1, // we increment the version number
			definition: {
				services: [],
				structures: [],
				masks: [],
				enumerations: [],
				...oracle.data // replace default empty data with the application data if any
			}
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
}