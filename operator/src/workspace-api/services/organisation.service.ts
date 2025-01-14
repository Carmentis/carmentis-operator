import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { OrganisationEntity } from '../entities/organisation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrganisationDto } from '../dto/create-organisation.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { OrganisationAccessRightEntity } from '../entities/organisation-access-right.entity';
import { UpdateAccessRightDto } from '../dto/update-access-rights.dto';
import { ApplicationEntity } from '../entities/application.entity';
import ChainService from './chain.service';
import * as sdk from '@cmts-dev/carmentis-sdk';

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
			.getMany();
	}

	// Find all items
	async findAll(): Promise<{ id: number, name: string, logoUrl: string }[]> {
		return this.organisationEntityRepository.find({
			select: ['id', 'name', 'logoUrl'],
		});
	}


	// Delete an item by ID
	async remove(id: number): Promise<void> {
		await this.organisationEntityRepository.delete(id);
	}

	async createByName(organisationName: string): Promise<OrganisationEntity> {
		// create the organisation
		const item = this.organisationEntityRepository.create({
			name: organisationName,
		});

		// generate the signature key pair for the orgnisation
		const sk = sdk.crypto.generateKey256();
		const pk = sdk.crypto.secp256k1.publicKeyFromPrivateKey(sk);
		item.privateSignatureKey = sk;
		item.publicSignatureKey = pk;

		return this.organisationEntityRepository.save(item);
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

	async getBalanceOfOrganisation(organisationId: number) {
		const entity = await this.organisationEntityRepository.findOneBy({
			id: organisationId,
		});
		return entity.balance;
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
			organisation.balance -= mb.header.gas; // TODO get the balance account from the node
			await this.update(organisation.id, organisation);
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
}