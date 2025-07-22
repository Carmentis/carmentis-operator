import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';
import CreateUserDto from '../../workspace/dto/create-user.dto';
import CreateNotWhitelistedUserDto from '../../workspace/dto/create-user-public.dto';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userEntityRepository: Repository<UserEntity>,
	) {
	}



	// Find one item by public key
	async findOneByPublicKey(publicKey: string): Promise<UserEntity> {
		const user = this.userEntityRepository.findOne({
			where: {
				publicKey: publicKey
			},
		});
		if (!user) throw new NotFoundException();
		return user;
	}



	/**
	 *
	 */
	async createAdministrator(
		createUserDto: CreateUserDto,
	): Promise<UserEntity> {
		const item = this.userEntityRepository.create(
			createUserDto,
		);
		item.isAdmin = true;
		return this.userEntityRepository.save(item);
	}


	/**
	 * Returns all administrators.
	 */
	async findAllAdministrators(): Promise<UserEntity[]> {
		return this.userEntityRepository.find({
			where: {
				isAdmin: true,
			},
		});
	}

	async deleteUser(deletedAdminPublicKey: string): Promise<DeleteResult> {
		return this.userEntityRepository.delete(deletedAdminPublicKey);
	}

	async findAllUsers() {
		return this.userEntityRepository.find();
	}

	async createUser(createUserDto: CreateUserDto) {
		const item = this.userEntityRepository.create(
			createUserDto,
		);
		return this.userEntityRepository.save(item);
	}


	async createNotWhitelistedUser(createUserDto: CreateNotWhitelistedUserDto) {
		const item = this.userEntityRepository.create(
			createUserDto,
		);
		item.isAdmin = false;
		return this.userEntityRepository.save(item);
	}


	async search(query: string): Promise<UserEntity[]> {
		return this.userEntityRepository.createQueryBuilder('user')
			.where('user.firstname LIKE :query', { query: `%${query}%` })
			.orWhere('user.lastname LIKE :query', { query: `%${query}%` })
			.orWhere('user.publicKey LIKE :query', { query: `%${query}%` })
			.limit(30)
			.getMany();
	}


	async findUserInOrganisation(userPublicKey: string, organisationId: number) {
		return this.userEntityRepository
			.createQueryBuilder('user')
			.innerJoinAndSelect('user.accessRights', 'accessRight')
			.innerJoin('accessRight.organisation', 'organisation')
			.where('organisation.id = :organisationId', { organisationId })
			.andWhere('user.publicKey = :userPublicKey', { userPublicKey })
			.getOne();
	}

	async countAdministrators() {
		return this.userEntityRepository.count({
			where: { isAdmin: true }
		})
	}

	async markAsAdmin(publicKey: string, isAdmin: boolean) {
		return this.userEntityRepository.update(publicKey, { isAdmin });
	}
}