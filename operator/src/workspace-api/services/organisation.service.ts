import { Injectable } from '@nestjs/common';
import { OrganisationEntity } from '../entities/organisation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrganisationDto } from '../dto/create-organisation.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class OrganisationService {
	constructor(
		@InjectRepository(OrganisationEntity)
		private readonly organisationEntityRepository: Repository<OrganisationEntity>,

		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	) {
	}

	// Find one item by ID
	async findOne(id: number): Promise<OrganisationEntity> {
		return this.organisationEntityRepository.findOne({
			where: {id: id},
			relations: ['owner'],
		});
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

	// Insert a new item
	async create(
		createOrganisationDto: CreateOrganisationDto,
	): Promise<OrganisationEntity> {
		const item = this.organisationEntityRepository.create(
			createOrganisationDto,
		);
		return this.organisationEntityRepository.save(item);
	}

	// Delete an item by ID
	async remove(id: number): Promise<void> {
		await this.organisationEntityRepository.delete(id);
	}

	async createByName(organisationName: string): Promise<OrganisationEntity> {
		const item = this.organisationEntityRepository.create({
			name: organisationName,
		});
		return this.organisationEntityRepository.save(item);
	}

	update(organisation: OrganisationEntity) {
		return this.organisationEntityRepository.save(organisation);
	}
}