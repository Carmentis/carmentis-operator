import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { OrganisationEntity } from '../entities/organisation.entity';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
import { ApplicationEntity } from '../entities/application.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationAccessRightEntity } from '../entities/organisation-access-right.entity';
import { ApplicationService } from './application.service';
import { AccessRightService } from './access-right.service';
import { OrganisationService } from './organisation.service';
import { ApplicationDataType } from '../../workspace-api/types/application-data.type';
import { EnvService } from './env.service';


const FILESIGN_NAME = 'FileSign';
const FILESIGN_APPLICATION_DOMAIN = 'https://filesign.carmentis.io?id={{id}}&version={{version}}'
const FILESIGN_DATA: ApplicationDataType = {
	fields: []
}

@Injectable()
export class SandboxService {
	constructor(
		@InjectRepository(OrganisationEntity)
		private readonly organisationEntityRepository: Repository<OrganisationEntity>,
		@InjectRepository(OrganisationAccessRightEntity)
		private readonly accessRightRepository: Repository<OrganisationAccessRightEntity>,
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
		private readonly applicationService: ApplicationService,
		private readonly accessRightService: AccessRightService,
		private readonly organisationService: OrganisationService,
		private readonly envService: EnvService,
	) {
	}

	async createSandbox(user: UserEntity) {

		// Check if the user has reached the limit of organisations where they are an administrator
		const adminOrganisationCount = await this.accessRightService.numberOfOrganisationsInWhichUserIsAdmin(
			user
		);
		if (!user.isAdmin && adminOrganisationCount >= this.envService.maxOrganisationsInWhichUserIsAdmin) {
			throw new UnauthorizedException('You have reached the limit of organisations where you can be an administrator.');
		}

		// recover the number of organisations
		const highestId = await this.organisationService.getHighestOrganisationId();

		// create the sandbox
		let sandbox = new OrganisationEntity();
		sandbox.name = `Sandbox-${highestId + 1}`;
		sandbox.isSandbox = true;
		sandbox.countryCode = 'FR';
		sandbox.city = 'Paris';

		// generate the signature key pair for the sandbox
		const sk = sdk.crypto.generateKey256();
		const pk = sdk.crypto.secp256k1.publicKeyFromPrivateKey(sk);
		sandbox.privateSignatureKey = sk;
		sandbox.publicSignatureKey = pk;

		// save the sandbox
		sandbox = await this.organisationEntityRepository.save(
			this.organisationEntityRepository.create(sandbox)
		);

		// publish the sandbox
		sandbox = await this.organisationService.publishOrganisation(sandbox.id);

		// create the pre-installed applications
		let fileSign: ApplicationEntity = new ApplicationEntity();
		fileSign.name = FILESIGN_NAME;
		fileSign.data = FILESIGN_DATA;
		fileSign.organisation = sandbox;
		fileSign.domain = FILESIGN_APPLICATION_DOMAIN

		// save the application
		fileSign  = await this.applicationRepository.save(
			this.applicationRepository.create(fileSign)
		);

		// publish fileSign
		await this.applicationService.publishApplication(fileSign.id);

		// create an initial access right with the user associated with the provided public key
		const accessRight = this.accessRightRepository.create({
			organisation: sandbox,
			user,
			isAdmin: true,
			editUsers: true,
			editApplications: true,
			editOracles: true,
		})
		await this.accessRightRepository.save(accessRight);

		// return the created sandbox
		return {id: sandbox.id};
	}

}