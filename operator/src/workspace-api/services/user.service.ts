import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Like, Or, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import CreateUserDto from '../dto/create-user.dto';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userEntityRepository: Repository<UserEntity>,
	) {
	}

	// Find one item by public key
	async findOneByPublicKey(publicKey: string): Promise<UserEntity> {
		return this.userEntityRepository.findOne({
			where: {
				publicKey: publicKey
			},
		});
	}

	// Find all items
	async findAll(): Promise<UserEntity[]> {
		return this.userEntityRepository.find();
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
		return this.userEntityRepository.find({
			where: {
				isAdmin: false,
			},
		});
	}

	async createUser(createUserDto: CreateUserDto) {
		const item = this.userEntityRepository.create(
			createUserDto,
		);
		return this.userEntityRepository.save(item);
	}

	async search(query: string): Promise<UserEntity[]> {
		return this.userEntityRepository.createQueryBuilder('user')
			.select(["user.publicKey", "user.firstname", "user.lastname"])
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
}