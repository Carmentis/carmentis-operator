import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationAccessRightEntity } from '../entities/organisation-access-right.entity';
import { UserEntity } from '../entities/user.entity';

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

	async numberOfOrganisationsInWhichUserIsAdmin(user: UserEntity) {
		return await this.accessRightRepository
			.createQueryBuilder('accessRight')
			.innerJoin('accessRight.organisation', 'organisation')
			.where('accessRight.userPublicKey = :userPublicKey', { userPublicKey: user.publicKey })
			.andWhere('accessRight.isAdmin = :isAdmin', { isAdmin: true })
			.getCount();
	}
}
