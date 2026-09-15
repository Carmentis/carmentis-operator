import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';
import { InvitationEntity } from '../entities/InvitationEntity';

/**
 * Creates a brand-new UserEntity for a wallet public key that just proved control of the
 * matching private key (see `CarmentisDeskAuthService.verifySignedChallenge`), and (when
 * registering through an invitation) atomically consumes that invitation in the same
 * transaction. If the invitation was consumed by a concurrent request in the meantime, the
 * whole transaction (including the newly created user) is rolled back.
 *
 * The pseudo is never supplied by the client: it is always auto-generated ("User 1", "User 2",
 * …) here, inside the transaction, so it can never collide with a concurrently-registering user.
 */
@Injectable()
export class RegistrationService {
	constructor(
		@InjectDataSource()
		private readonly dataSource: DataSource,
	) {}

	async completeRegistration(params: {
		publicKey: string;
		invitation?: InvitationEntity;
	}): Promise<UserEntity> {
		return this.dataSource.transaction(async (manager) => {
			const pseudo = await this.generateUniquePseudo(manager);
			const user = manager.create(UserEntity, {
				publicKey: params.publicKey,
				pseudo,
			});
			await manager.save(user);

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

	/**
	 * Finds the next free "User N" pseudo, starting just past the current user count. Probes
	 * sequentially rather than trusting the count alone, since users can be deleted (leaving
	 * gaps) and a plain count could otherwise collide with an existing pseudo.
	 */
	private async generateUniquePseudo(manager: EntityManager): Promise<string> {
		let n = (await manager.count(UserEntity)) + 1;
		for (;;) {
			const candidate = `User ${n}`;
			const exists = await manager.exists(UserEntity, { where: { pseudo: candidate } });
			if (!exists) return candidate;
			n += 1;
		}
	}
}
