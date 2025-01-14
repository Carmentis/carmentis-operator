import { HttpCode, HttpException, HttpStatus, Injectable, NotImplementedException, OnModuleInit } from '@nestjs/common';
import * as sdk from "@cmts-dev/carmentis-sdk";
import { ApplicationEntity } from '../entities/application.entity';
import { OrganisationEntity } from '../entities/organisation.entity';
import { OrganisationService } from './organisation.service';


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


	constructor() {}

	onModuleInit() {
		sdk.blockchain.blockchainCore.setNode("http://127.0.0.1:3000");
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
		// TODO remove the hardcoded node
		// initialise the blockchain sdk
		sdk.blockchain.blockchainCore.setNode("http://127.0.0.1:3000");
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
			throw new HttpException("Failed to publish the organisation", HttpStatus.NOT_ACCEPTABLE);
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
		// TODO remove the hardcoded node
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
			// TODO add operator server
			/*
			await vc.addOperatorServer({
				...
			});
			 */
		} else {
			console.log("Loading existing application", application);
			await vc.load(application.virtualBlockchainId);
		}

		await vc.addDescription( {
			name: application.name,
			logoUrl: application.logoUrl || '',
			homepageUrl: application.website || '',
			rootDomain: application.domain || '',
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

		await vc.sign();

		return vc.publish()
	}


}