import { BadRequestException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { randomBytes, createHash } from 'crypto';
import { InvitationEntity } from '../entities/InvitationEntity';
import { UserEntity } from '../entities/UserEntity';
import { OperatorConfigService } from '../config/services/operator-config.service';

export type InvitationStatus = 'pending' | 'used' | 'expired';

@Injectable()
export class InvitationService {
	constructor(
		@InjectRepository(InvitationEntity)
		private readonly repository: Repository<InvitationEntity>,
		private readonly config: OperatorConfigService,
	) {}

	private hashToken(rawToken: string): string {
		return createHash('sha256').update(rawToken).digest('hex');
	}

	async createInvitation(createdBy: UserEntity): Promise<{ token: string; invitation: InvitationEntity }> {
		const token = randomBytes(32).toString('base64url');
		const invitation = this.repository.create({
			tokenHash: this.hashToken(token),
			createdByUserId: createdBy.id,
			expiresAt: new Date(Date.now() + this.config.getInvitationExpirySeconds() * 1000),
		});
		await this.repository.save(invitation);
		return { token, invitation };
	}

	/**
	 * Validates that a token is well-formed, known, not expired, and not already used.
	 * Does NOT consume it — callers must call `consumeInvitation` once registration
	 * actually succeeds, and should re-validate close to that point since a valid
	 * invitation can become stale between the two calls (link opened twice concurrently).
	 */
	async validateToken(rawToken: string): Promise<InvitationEntity> {
		const invitation = await this.repository.findOne({ where: { tokenHash: this.hashToken(rawToken) } });
		if (!invitation) {
			throw new NotFoundException('Invalid invitation link');
		}
		if (invitation.usedAt) {
			throw new GoneException('This invitation link has already been used');
		}
		if (invitation.expiresAt.getTime() < Date.now()) {
			throw new GoneException('This invitation link has expired');
		}
		return invitation;
	}

	/**
	 * Atomically marks an invitation as used. Throws if it was already consumed by a
	 * concurrent request in the meantime (single-use enforcement under race conditions).
	 */
	async consumeInvitation(invitation: InvitationEntity, usedBy: UserEntity): Promise<void> {
		const result = await this.repository.update(
			{ id: invitation.id, usedAt: IsNull() },
			{ usedAt: new Date(), usedByUserId: usedBy.id },
		);
		if (result.affected !== 1) {
			throw new BadRequestException('This invitation link has already been used');
		}
	}

	async listForUser(createdByUserId: number): Promise<InvitationEntity[]> {
		return this.repository.find({
			where: { createdByUserId },
			order: { createdAt: 'DESC' },
			relations: ['usedBy'],
		});
	}

	getStatus(invitation: InvitationEntity): InvitationStatus {
		if (invitation.usedAt) return 'used';
		if (invitation.expiresAt.getTime() < Date.now()) return 'expired';
		return 'pending';
	}
}
