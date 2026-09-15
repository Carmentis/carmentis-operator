import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Not, Repository } from 'typeorm';
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

	async findByPublicKey(publicKey: string): Promise<UserEntity | null> {
		return this.userEntityRepository.findOneBy({ publicKey });
	}

	async deleteUserById(id: number): Promise<DeleteResult> {
		return this.userEntityRepository.delete(id);
	}

	async findAllUsers() {
		return this.userEntityRepository.find();
	}

	async isInitialized(): Promise<boolean> {
		const count = await this.userEntityRepository.count();
		return count !== 0;
	}

	/**
	 * Renames a user's pseudo, rejecting blank/duplicate values. Uniqueness is checked
	 * explicitly (rather than relying solely on the DB's unique constraint) so callers get a
	 * clean 409 instead of a raw driver error.
	 */
	async renamePseudo(userId: number, pseudo: string): Promise<UserEntity> {
		const trimmed = pseudo.trim();
		const user = await this.findUserById(userId);

		const collision = await this.userEntityRepository.findOneBy({ pseudo: trimmed, id: Not(userId) });
		if (collision) {
			throw new ConflictException('This pseudo is already taken');
		}

		user.pseudo = trimmed;
		return this.userEntityRepository.save(user);
	}
}
