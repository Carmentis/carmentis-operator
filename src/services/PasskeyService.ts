import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCredentialEntity } from '../entities/UserCredentialEntity';

@Injectable()
export class PasskeyService {
	constructor(
		@InjectRepository(UserCredentialEntity)
		private readonly repository: Repository<UserCredentialEntity>,
	) {}

	async listForUser(userId: number): Promise<UserCredentialEntity[]> {
		return this.repository.find({
			where: { userId },
			order: { createdAt: 'ASC' },
		});
	}

	async createForUser(params: {
		userId: number;
		credentialId: string;
		publicKey: string;
		counter: number;
		transports?: string[];
		deviceType?: string;
		backedUp?: boolean;
		name?: string;
	}): Promise<UserCredentialEntity> {
		const entity = this.repository.create(params);
		return this.repository.save(entity);
	}

	async rename(userId: number, credentialId: string, name: string): Promise<UserCredentialEntity> {
		const credential = await this.findOwned(userId, credentialId);
		credential.name = name;
		return this.repository.save(credential);
	}

	/**
	 * Removes a passkey, unless it is the user's last remaining one — a user must never be
	 * left with zero means of authenticating into their own account.
	 */
	async remove(userId: number, credentialId: string): Promise<void> {
		const credential = await this.findOwned(userId, credentialId);
		const total = await this.repository.count({ where: { userId } });
		if (total <= 1) {
			throw new BadRequestException('Cannot remove your last remaining passkey');
		}
		await this.repository.remove(credential);
	}

	private async findOwned(userId: number, credentialId: string): Promise<UserCredentialEntity> {
		const credential = await this.repository.findOne({ where: { id: credentialId } });
		if (!credential) {
			throw new NotFoundException('Passkey not found');
		}
		if (credential.userId !== userId) {
			throw new ForbiddenException('This passkey does not belong to you');
		}
		return credential;
	}
}
