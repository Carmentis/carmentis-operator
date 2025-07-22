import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationAccessRightEntity } from '../entities/OrganisationAccessRightEntity';
import { UserEntity } from '../entities/UserEntity';

@Injectable()
export class AccessRightService {
	constructor(
		@InjectRepository(OrganisationAccessRightEntity)
		private readonly accessRightRepository: Repository<OrganisationAccessRightEntity>,
	) {
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
