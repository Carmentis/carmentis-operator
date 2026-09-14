import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';

@Injectable()
export class UserService extends TypeOrmCrudService<UserEntity> {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userEntityRepository: Repository<UserEntity>,
	) {
		super(userEntityRepository);
	}

	async findUserById(id: number): Promise<UserEntity> {
		const user = await this.userEntityRepository.findOneBy({ id });
		if (!user) throw new NotFoundException();
		return user;
	}

	async deleteUserById(id: number): Promise<DeleteResult> {
		return this.userEntityRepository.delete(id);
	}

	async findAllUsers() {
		return this.userEntityRepository.find();
	}

	async createUser(dto: { pseudo: string; email?: string }): Promise<UserEntity> {
		const item = this.userEntityRepository.create({
			pseudo: dto.pseudo,
			email: dto.email,
		});
		return this.userEntityRepository.save(item);
	}

	async isInitialized(): Promise<boolean> {
		const count = await this.userEntityRepository.count();
		return count !== 0;
	}
}
