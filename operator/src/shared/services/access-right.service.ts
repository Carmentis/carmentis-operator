import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationAccessRightEntity } from '../entities/organisation-access-right.entity';

@Injectable()
export class AccessRightService {
	constructor(
		@InjectRepository(OrganisationAccessRightEntity)
		private readonly accessRightRepository: Repository<OrganisationAccessRightEntity>,
	) {
	}


	// Insert a new item
	async createAccessRight(
		accessRight: OrganisationAccessRightEntity,
	): Promise<OrganisationAccessRightEntity> {
		const item = this.accessRightRepository.create(accessRight);
		return this.accessRightRepository.save(item);
	}
}
