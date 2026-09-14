import { DataSource } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';
import { UserCredentialEntity } from '../entities/UserCredentialEntity';
import { InvitationEntity } from '../entities/InvitationEntity';
import { WebauthnChallengeEntity } from '../entities/WebauthnChallengeEntity';
import { InvitationService } from './InvitationService';
import { RegistrationService } from './RegistrationService';
import { RegistrationResult } from './WebauthnService';

describe('RegistrationService', () => {
	let dataSource: DataSource;
	let invitationService: InvitationService;
	let registrationService: RegistrationService;
	let admin: UserEntity;

	function fakeChallengeRow(overrides: Partial<WebauthnChallengeEntity> = {}): WebauthnChallengeEntity {
		return {
			id: 'challenge-1',
			challenge: 'chal',
			purpose: 'registration',
			consumed: true,
			expiresAt: new Date(Date.now() + 60000),
			createdAt: new Date(),
			pendingPseudo: 'invitee',
			pendingEmail: undefined,
			...overrides,
		} as WebauthnChallengeEntity;
	}

	function fakeCredential(overrides: Partial<RegistrationResult> = {}): RegistrationResult {
		return {
			challengeRow: fakeChallengeRow(),
			credentialId: 'cred-1',
			publicKey: 'pub',
			counter: 0,
			deviceType: 'singleDevice',
			backedUp: false,
			...overrides,
		};
	}

	beforeEach(async () => {
		dataSource = new DataSource({
			type: 'sqlite',
			database: ':memory:',
			synchronize: true,
			entities: [UserEntity, UserCredentialEntity, InvitationEntity, WebauthnChallengeEntity],
		});
		await dataSource.initialize();

		const userRepository = dataSource.getRepository(UserEntity);
		admin = await userRepository.save(userRepository.create({ pseudo: 'admin' }));

		const config = { getInvitationExpirySeconds: () => 86400 } as any;
		invitationService = new InvitationService(dataSource.getRepository(InvitationEntity), config);
		registrationService = new RegistrationService(dataSource as any);
	});

	afterEach(async () => {
		await dataSource.destroy();
	});

	it('creates the user and its first credential, and consumes the invitation', async () => {
		const { invitation } = await invitationService.createInvitation(admin);
		const challengeRow = fakeChallengeRow({ pendingPseudo: 'invitee', invitationId: invitation.id });

		const user = await registrationService.completeRegistration({
			challengeRow,
			credential: fakeCredential({ challengeRow }),
			invitation,
		});

		expect(user.pseudo).toBe('invitee');
		const credentials = await dataSource.getRepository(UserCredentialEntity).find({ where: { userId: user.id } });
		expect(credentials).toHaveLength(1);

		const reloadedInvitation = await dataSource.getRepository(InvitationEntity).findOneBy({ id: invitation.id });
		expect(reloadedInvitation.usedAt).not.toBeNull();
		expect(reloadedInvitation.usedByUserId).toBe(user.id);
	});

	it('does not create a user when the invitation was already consumed (rolls back the transaction)', async () => {
		const { invitation } = await invitationService.createInvitation(admin);
		const otherUserRepository = dataSource.getRepository(UserEntity);
		const otherUser = await otherUserRepository.save(otherUserRepository.create({ pseudo: 'already-registered' }));
		await invitationService.consumeInvitation(invitation, otherUser);

		const challengeRow = fakeChallengeRow({ pendingPseudo: 'late-comer', invitationId: invitation.id });

		await expect(
			registrationService.completeRegistration({
				challengeRow,
				credential: fakeCredential({ challengeRow }),
				invitation,
			}),
		).rejects.toThrow();

		const users = await dataSource.getRepository(UserEntity).find();
		expect(users.map((u) => u.pseudo)).not.toContain('late-comer');
	});

	it('cannot be used to register a second account once the invitation was already consumed', async () => {
		// This exercises the same atomic "consume exactly once" guarantee as the concurrent
		// race covered in InvitationService.spec.ts (IsNull() + affected-rows check), applied
		// here through RegistrationService's transaction. A raw two-connection sqlite
		// DataSource in a unit test cannot safely run two *overlapping* transactions (the
		// driver itself rejects nested/concurrent transactions on a single connection), so
		// this test drives the same invariant sequentially instead of via Promise.all.
		const { invitation } = await invitationService.createInvitation(admin);

		const attempt = (pseudo: string) => {
			const challengeRow = fakeChallengeRow({ pendingPseudo: pseudo, invitationId: invitation.id });
			return registrationService.completeRegistration({
				challengeRow,
				credential: fakeCredential({ challengeRow, credentialId: `cred-${pseudo}` }),
				invitation,
			});
		};

		const first = await attempt('first');
		expect(first.pseudo).toBe('first');

		await expect(attempt('second')).rejects.toThrow();

		const users = await dataSource.getRepository(UserEntity).find();
		expect(users.map((u) => u.pseudo).sort()).toEqual(['admin', 'first']);
	});

	it('creates a user without touching invitations for the invitation-less setup flow', async () => {
		const challengeRow = fakeChallengeRow({ pendingPseudo: 'first-admin', invitationId: undefined });
		const user = await registrationService.completeRegistration({
			challengeRow,
			credential: fakeCredential({ challengeRow }),
		});
		expect(user.pseudo).toBe('first-admin');
	});
});
