import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { OrganisationEntity } from '../entities/organisation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { OrganisationAccessRightEntity } from '../entities/organisation-access-right.entity';
import { UpdateAccessRightDto } from '../dto/update-access-rights.dto';
import { ApplicationEntity } from '../entities/application.entity';
import ChainService from './chain.service';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
import { ApplicationDataType } from '../types/application-data.type';
import { ApplicationService } from './application.service';


const FILESIGN_NAME = 'FileSign';
const FILESIGN_APPLICATION_DOMAIN = 'https://filesign.carmentis.io?id={{id}}&version={{version}}'
const FILESIGN_DATA: ApplicationDataType = {
	fields: [
		{
			name: 'SenderEmail',
			type: sdk.utils.data.createType({
				type: sdk.constants.DATA.STRING,
				public: false
			}),
		},
		{
			name: 'ReceiverEmail',
			type: sdk.utils.data.createType({
				type: sdk.constants.DATA.STRING,
				public: false
			}),
		},
	]
}


@Injectable()
export class OrganisationService {
	constructor(
		@InjectRepository(OrganisationEntity)
		private readonly organisationEntityRepository: Repository<OrganisationEntity>,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(OrganisationAccessRightEntity)
		private readonly accessRightRepository: Repository<OrganisationAccessRightEntity>,
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
		private readonly chainService: ChainService,
		private readonly applicationService: ApplicationService,
	) {
	}

	// Find one item by ID
	async findOne(id: number): Promise<OrganisationEntity> {
		const organisation = await this.organisationEntityRepository.findOne({
			where: { id: id },
		});
		if (!organisation) {
			throw new NotFoundException('Organisation not found');
		}
		return organisation;
	}

	async findAccessRightsByOrganisationId(organisationId: number): Promise<OrganisationAccessRightEntity[]> {
		return this.accessRightRepository
			.createQueryBuilder('accessRight')
			.select()
			.innerJoin('accessRight.organisation', 'organisation')
			.innerJoinAndSelect('accessRight.user', 'user')
			.where('organisation.id = :organisationId', { organisationId })
			.getMany();
	}

	async findAllUsersInOrganisation(organisationId: number): Promise<UserEntity[]> {
		return this.userRepository
			.createQueryBuilder('user')
			.innerJoinAndSelect('user.accessRights', 'accessRight')
			.innerJoin('accessRight.organisation', 'organisation')
			.where('organisation.id = :organisationId', { organisationId })
			.orderBy('user.publicKey')
			.getMany();
	}

	// Find all items
	async findAll(): Promise<{ id: number, name: string, logoUrl: string }[]> {
		return this.organisationEntityRepository.find({
			select: ['id', 'name', 'logoUrl', 'isSandbox'],
		});
	}


	// Delete an item by ID
	async remove(id: number): Promise<void> {
		await this.organisationEntityRepository.delete(id);
	}


	/**
	 * Creates a new organisation with the specified name and associates the authenticated user with administrative access rights.
	 *
	 * @param {UserEntity} authUser - The authenticated user who will be granted administrative rights to the newly created organisation.
	 * @param {string} organisationName - The name of the organisation to be created.
	 * @return {Promise<OrganisationEntity>} A promise that resolves to the newly created organisation entity.
	 */
	async createByName(authUser: UserEntity, organisationName: string): Promise<OrganisationEntity> {
		// create the organisation
		const item = this.organisationEntityRepository.create({
			name: organisationName,
		});

		// generate the signature key pair for the orgnisation
		const sk = sdk.crypto.generateKey256();
		const pk = sdk.crypto.secp256k1.publicKeyFromPrivateKey(sk);
		item.privateSignatureKey = sk;
		item.publicSignatureKey = pk;
		const organisation = await this.organisationEntityRepository.save(item);

		// we create an initial access right with the provided public key
		const accessRight = this.accessRightRepository.create({
			organisation,
			user: authUser,
			editApplications: true,
			isAdmin: true,
			editOracles: true,
			editUsers: true,
		})
		await this.accessRightRepository.save(accessRight);
		return organisation
	}


	async createSandbox(publicKey: string) {
		const user = await this.userRepository.findOneBy({ publicKey });
		if (!user) throw new NotFoundException('User not found');

		// recover the number of organisations
		const numberOfOrganisations = await this.organisationEntityRepository.count();

		// create the sandbox
		let sandbox = new OrganisationEntity();
		sandbox.name = `Sandbox-${numberOfOrganisations}`;
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
		sandbox = await this.publishOrganisation(sandbox.id);

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
		return sandbox;

	}

	// Insert a new item
	async createAccessRight(
		accessRight: OrganisationAccessRightEntity,
	): Promise<OrganisationAccessRightEntity> {
		const item = this.accessRightRepository.create(accessRight);
		return this.accessRightRepository.save(item);
	}

	async removeUserFromOrganisation(organisationId: number, userPublicKey: string) {
		// search for the access right entity
		return await this.accessRightRepository.delete({
			user: { publicKey: userPublicKey },
			organisation: { id: organisationId },
		});
	}


	async updateAccessRights(organisationId: number, userPublicKey: string, rights: UpdateAccessRightDto) {
		return await this.accessRightRepository.update({
			id: rights.id,
		}, rights);
	}

	async getNumberOfApplicationsInOrganisation(organisationId: number) {
		return this.applicationRepository
			.createQueryBuilder('app')
			.select()
			.innerJoinAndSelect('app.organisation', 'org')
			.where('org.id = :organisationId', { organisationId })
			.getCount();
	}

	async getNumberOfUsersInOrganisation(organisationId: number) {
		return this.accessRightRepository
			.createQueryBuilder('ar')
			.select()
			.innerJoinAndSelect('ar.organisation', 'org')
			.where('org.id = :organisationId', { organisationId })
			.getCount();
	}

	async search(query: string) {
		return this.organisationEntityRepository.createQueryBuilder('org')
			.select(['org.id', 'org.name'])
			.where('org.name LIKE :query', { query: `%${query}%` })
			.limit(10)
			.getMany();
	}

	async findOrganisationsByUser(publicKey: string) {
		return this.organisationEntityRepository.createQueryBuilder('org')
			.select(['org.id', 'org.name'])
			.innerJoin('org.accessRights', 'ar')
			.where('ar.user.publicKey = :publicKey', { publicKey })
			.getMany();
	}

	async publishOrganisation(organisationId: number) {
		const organisation: OrganisationEntity = await this.organisationEntityRepository.findOneBy({ id: organisationId });
		try {
			const mb : MicroBlock = await this.chainService.publishOrganisation(organisation);

			// init the organisation chain status if first micro-block
			if ( mb.header.height === 1 ) {
				organisation.virtualBlockchainId = mb.hash;
			}

			// update the organisation
			organisation.version = mb.header.height;
			organisation.published = true;
			organisation.isDraft = false;
			organisation.publishedAt = new Date();
			return await this.update(organisation.id, organisation);
		} catch (e) {
			console.error(e)
			throw new InternalServerErrorException('Failed to publish the organisation');
		}

	}

	async getPublicationCost(organisationId: number) {
		return Promise.resolve(undefined);
	}

	async update(organisationId: number, organisation: OrganisationEntity) {

		// Update the organisation entity in the database
		const existingOrganisation = await this.organisationEntityRepository.findOneBy({ id: organisationId });

		if (!existingOrganisation) {
			throw new NotFoundException(`Organisation with id ${organisationId} not found`);
		}

		// Merge the updates into the existing organisation entity
		const updatedOrganisation = this.organisationEntityRepository.merge(existingOrganisation, organisation);

		// Save the updated organisation back to the database
		return this.organisationEntityRepository.save(updatedOrganisation);
	}

	async findAccessRightsOfUserInOrganisation(user: UserEntity, organisation: OrganisationEntity | number): Promise<OrganisationAccessRightEntity> {
		return this.accessRightRepository
			.createQueryBuilder('accessRight')
			.select()
			.innerJoin('accessRight.organisation', 'organisation')
			.innerJoinAndSelect('accessRight.user', 'user')
			.where('organisation.id = :organisationId', { organisationId: typeof  organisation === 'number' ? organisation : organisation.id })
			.andWhere('user.publicKey = :publicKey', { publicKey: user.publicKey })
			.getOne();
	}

	countUsers(organisationId: number) {
		return this.userRepository
			.createQueryBuilder('user')
			.innerJoinAndSelect('user.accessRights', 'accessRight')
			.innerJoin('accessRight.organisation', 'organisation')
			.where('organisation.id = :organisationId', { organisationId })
			.getCount();
	}

	async countAdminInOrganisations(organisationId: number) {
		return this.userRepository
			.createQueryBuilder('user')
			.innerJoinAndSelect('user.accessRights', 'accessRight')
			.innerJoin('accessRight.organisation', 'organisation')
			.where('organisation.id = :organisationId', { organisationId })
			.andWhere('accessRight.isAdmin = :isAdmin', {isAdmin: true})
			.getCount();
	}
}