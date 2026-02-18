import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';
import CreateUserDto from '../workspace/dto/create-user.dto';
import CreateNotWhitelistedUserDto from '../workspace/dto/create-user-public.dto';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';

@Injectable()
export class UserService extends TypeOrmCrudService<UserEntity> {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userEntityRepository: Repository<UserEntity>,
	) {
		super(userEntityRepository);
	}

	// Find one item by public key
	async findUserByPublicKey(publicKey: string): Promise<UserEntity> {
		const user = this.userEntityRepository.findOne({
			where: {
				publicKey: publicKey
			},
		});
		if (!user) throw new NotFoundException();
		return user;
	}


	async deleteUserByPublicKey(deletedAdminPublicKey: string): Promise<DeleteResult> {
		return this.userEntityRepository.delete(deletedAdminPublicKey);
	}

	async findAllUsers() {
		return this.userEntityRepository.find();
	}

	async createUser(publicKey: string, pseudo: string) {
		const item = this.userEntityRepository.create({
			publicKey,
			pseudo
		});
		return this.userEntityRepository.save(item);
	}
}