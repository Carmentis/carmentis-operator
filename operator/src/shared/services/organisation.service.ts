import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
	UnprocessableEntityException,
} from '@nestjs/common';
import { OrganisationEntity } from '../entities/organisation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { OrganisationAccessRightEntity } from '../entities/organisation-access-right.entity';
import { UpdateAccessRightDto } from '../../workspace-api/dto/update-access-rights.dto';
import { ApplicationEntity } from '../entities/application.entity';
import ChainService from './chain.service';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
import { AccessRightService } from './access-right.service';
import { EnvService } from './env.service';


@Injectable()
export class OrganisationService {
	constructor(
		@InjectRepository(OrganisationEntity)
		private readonly organisationEntityRepository: Repository<OrganisationEntity>,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(OrganisationAccessRightEntity)
		private readonly accessRightRepository: Repository<OrganisationAccessRightEntity>,
		private readonly accessRightService: AccessRightService,
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
		private readonly chainService: ChainService,
		private readonly envService: EnvService,
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

	async findPublicKeyById(organisationId: number): Promise<{publicSignatureKey: string}> {
		return await this.organisationEntityRepository.findOne({
			where: {id: organisationId},
			select: ['publicSignatureKey'],
		});
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
	async findAll(): Promise<{ id: number, name: string, logoUrl: string, publicSignatureKey: string }[]> {
		return this.organisationEntityRepository.find({
			select: ['id', 'name', 'logoUrl', 'isSandbox', 'publicSignatureKey'],
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

		// Check if the user has reached the limit of organisations where they are an administrator
		const adminOrganisationCount = await this.accessRightService.numberOfOrganisationsInWhichUserIsAdmin(
			authUser
		);
		if (!authUser.isAdmin && adminOrganisationCount >= this.envService.maxOrganisationsInWhichUserIsAdmin) {
			throw new UnauthorizedException('You have reached the limit of organisations where you can be an administrator.');
		}

		// create the organisation
		const item = this.organisationEntityRepository.create({
			name: organisationName,
		});

		// generate the signature key pair for the organisation
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
			.innerJoinAndSelect('app.organisation', 'org')
			.where('org.id = :organisationId', { organisationId })
			.getCount();
	}

	async getNumberOfOraclesInOrganisation(organisationId: number) {
		return this.applicationRepository
			.createQueryBuilder('or')
			.innerJoinAndSelect('or.organisation', 'org')
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
			.select(['org.id', 'org.name', "org.publicSignatureKey"])
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
			if (e.code === 'ECONNREFUSED') {
				throw new InternalServerErrorException("Cannot connect to the node.");
			} else {
				throw new UnprocessableEntityException(e)
			}
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

	async isPublished(organisationId: number) {
		const organisation = await this.organisationEntityRepository.findOneBy({ id: organisationId });
		if (!organisation) {
			throw new NotFoundException(`Organisation with id ${organisationId} not found`);
		}
		return organisation.published;
	}

	async findOrganisationFromApplicationVirtualBlockchainId(applicationId: string) {

		const application = await this.applicationRepository
			.createQueryBuilder('app')
			.innerJoinAndSelect('app.organisation', 'organisation')
			.where('app.virtualBlockchainId = :applicationId', { applicationId })
			.getOne();

		if (!application) {
			throw new NotFoundException(`No application found with virtualBlockchainId: ${applicationId}`);
		}

		return application.organisation!;
	}

	async findOrganisationFromVirtualBlockchainId(organisationId: string) {

		const organisation = await this.organisationEntityRepository
			.createQueryBuilder('organisation')
			.where('organisation.virtualBlockchainId = :organisationId', { organisationId })
			.getOne();

		if (!organisation) {
			throw new NotFoundException(`No organisation found with virtualBlockchainId: ${organisationId}`);
		}

		return organisation;
	}

	async findByQuery(query: string) {
		if (query.trim() === '') {
			// Return the first 50 organisations if the query is empty
			return await this.organisationEntityRepository.createQueryBuilder('org')
				.select(['org.id', 'org.name'])
				.limit(50)
				.getMany();
		} else {
			// Search for organisations whose names include the query (case insensitive)
			return await this.organisationEntityRepository.createQueryBuilder('org')
				.select(['org.id', 'org.name'])
				.where('LOWER(org.name) LIKE :query', { query: `%${query.toLowerCase()}%` })
				.limit(50)
				.getMany();
		}
	}

	async getOrganisationByApplicationId(applicationId: number) {

		return this.organisationEntityRepository.createQueryBuilder('organisation')
			.innerJoin('organisation.applications', 'application')
			.where('application.id = :applicationId', { applicationId })
			.getOne();
	}



	/**
	 * Deletes an organisation using the specified organisation ID.
	 *
	 * @param {number} organisationId - The unique identifier of the organisation to be deleted.
	 * @return {Promise<void>} A promise that resolves when the organisation is successfully deleted.
	 * @throws {NotFoundException} Throws an error if the organisation with the specified ID is not found.
	 */
	async deleteOrganisationById(organisationId: number): Promise<void> {
		const organisation = await this.organisationEntityRepository.findOneBy({ id: organisationId });

		if (!organisation) {
			throw new NotFoundException(`Organisation with id ${organisationId} not found`);
		}
		await this.organisationEntityRepository.remove(organisation);
	}

	/**
	 * Retrieves the highest organisation ID from the organisation table.
	 *
	 * @return {Promise<number>} A promise resolving to the highest organisation ID, or 0*/
	async getHighestOrganisationId() : Promise<number> {
		return this.organisationEntityRepository
			.createQueryBuilder('organisation')
			.select('MAX(organisation.id)', 'maxId')
			.getRawOne()
			.then(result => result?.maxId || 0);
	}

	/**
	 * Erases the publication information of the given organisation entity.
	 *
	 * @param {OrganisationEntity} organisation - The organisation entity whose publication details need to be erased.
	 * @return {Promise<void>} A promise that resolves when the organisation entity is successfully updated.
	 */
	async erasePublicationInformation(organisation: OrganisationEntity) {
		organisation.published = false;
		organisation.version = 0;
		organisation.virtualBlockchainId = null;
		organisation.publishedAt = null;
		organisation.isDraft = true;
		await this.organisationEntityRepository.save(organisation);

		// erase publication status of existing applications
		const applications = await this.applicationRepository.createQueryBuilder('application')
			.innerJoin('application.organisation', 'organisation')
			.where('organisation.id = :organisationId', { organisationId: organisation.id })
			.getMany();

		for (const application of applications) {
			await this.eraseApplicationPublicationStatus(application)
		}
	}

	async eraseApplicationPublicationStatus(application: ApplicationEntity) {
		application.virtualBlockchainId = null;
		application.isDraft = true;
		application.publishedAt = null;
		application.version = 0;
		application.published = false;
		await this.applicationRepository.save(application);
	}

}