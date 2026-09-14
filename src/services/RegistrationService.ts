import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';
import { UserCredentialEntity } from '../entities/UserCredentialEntity';
import { InvitationEntity } from '../entities/InvitationEntity';
import { WebauthnChallengeEntity } from '../entities/WebauthnChallengeEntity';
import { RegistrationResult } from './WebauthnService';

/**
 * Creates a brand-new UserEntity together with its first UserCredentialEntity, and (when
 * registering through an invitation) atomically consumes that invitation in the same
 * transaction. If the invitation was consumed by a concurrent request in the meantime, the
 * whole transaction (including the newly created user) is rolled back.
 */
@Injectable()
export class RegistrationService {
	constructor(
		@InjectDataSource()
		private readonly dataSource: DataSource,
	) {}

	async completeRegistration(params: {
		challengeRow: WebauthnChallengeEntity;
		credential: RegistrationResult;
		invitation?: InvitationEntity;
	}): Promise<UserEntity> {
		return this.dataSource.transaction(async (manager) => {
			const user = manager.create(UserEntity, {
				pseudo: params.challengeRow.pendingPseudo,
				email: params.challengeRow.pendingEmail || undefined,
			});
			await manager.save(user);

			const credential = manager.create(UserCredentialEntity, {
				userId: user.id,
				credentialId: params.credential.credentialId,
				publicKey: params.credential.publicKey,
				counter: params.credential.counter,
				transports: params.credential.transports,
				deviceType: params.credential.deviceType,
				backedUp: params.credential.backedUp,
			});
			await manager.save(credential);

			if (params.invitation) {
				const result = await manager.update(
					InvitationEntity,
					{ id: params.invitation.id, usedAt: IsNull() },
					{ usedAt: new Date(), usedByUserId: user.id },
				);
				if (result.affected !== 1) {
					throw new BadRequestException('This invitation link has already been used');
				}
			}

			return user;
		});
	}
}
