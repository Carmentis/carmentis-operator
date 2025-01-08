import { Injectable, NotImplementedException } from '@nestjs/common';
import * as sdk from "@cmts-dev/carmentis-sdk";
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
	constructor() {
	}

	async publishOrganisation(
		organisation: OrganisationEntity
	) {
		// TODO implement the organisation publishing logic
		const organisationVb = new sdk.blockchain.organizationVb()
		await organisationVb.addPublicKey({
			publicKey: organisation.publicSignatureKey
		});
		const signatureKey = sdk.crypto.generateKey256();
		await organisationVb.sign()
		await organisationVb.addDescription(organisation);
		return await organisationVb.publish();
	}

	/**
	 * Publishes an application to the blockchain.
	 *
	 * @param application The application to publish.
	 */
	async publishApplication(
		application: ApplicationEntity
	) {
		const vc = new sdk.blockchain.applicationVb();
		await vc.addDefinition({
			version: application.version,
			definition: application.data
		});
		// TODO do not forget to increase the version number and application states (including the application id in the blockchain)
		return vc.publish()
	}


}