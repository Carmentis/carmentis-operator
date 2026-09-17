import { DataSource } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';
import { InvitationEntity } from '../entities/InvitationEntity';
import { InvitationService } from './InvitationService';
import { RegistrationService } from './RegistrationService';

describe('RegistrationService', () => {
	let dataSource: DataSource;
	let invitationService: InvitationService;
	let registrationService: RegistrationService;
	let admin: UserEntity;

	beforeEach(async () => {
		dataSource = new DataSource({
			type: 'sqlite',
			database: ':memory:',
			synchronize: true,
			entities: [UserEntity, InvitationEntity],
		});
		await dataSource.initialize();

		const userRepository = dataSource.getRepository(UserEntity);
		admin = await userRepository.save(userRepository.create({ pseudo: 'admin', publicKey: 'pk-admin' }));

		const config = { getInvitationExpirySeconds: () => 86400 } as any;
		invitationService = new InvitationService(dataSource.getRepository(InvitationEntity), config);
		registrationService = new RegistrationService(dataSource as any);
	});

	afterEach(async () => {
		await dataSource.destroy();
	});

	it('creates the user with an auto-generated pseudo and consumes the invitation', async () => {
		const { invitation } = await invitationService.createInvitation(admin);

		const user = await registrationService.completeRegistration({
			publicKey: 'pk-invitee',
			invitation,
		});

		expect(user.publicKey).toBe('pk-invitee');
		expect(user.pseudo).toMatch(/^User \d+$/);

		const reloadedInvitation = await dataSource.getRepository(InvitationEntity).findOneBy({ id: invitation.id });
		expect(reloadedInvitation.usedAt).not.toBeNull();
		expect(reloadedInvitation.usedByUserId).toBe(user.id);
	});

	it('does not create a user when the invitation was already consumed (rolls back the transaction)', async () => {
		const { invitation } = await invitationService.createInvitation(admin);
		const otherUserRepository = dataSource.getRepository(UserEntity);
		const otherUser = await otherUserRepository.save(
			otherUserRepository.create({ pseudo: 'already-registered', publicKey: 'pk-other' }),
		);
		await invitationService.consumeInvitation(invitation, otherUser);

		await expect(
			registrationService.completeRegistration({ publicKey: 'pk-late-comer', invitation }),
		).rejects.toThrow();

		const users = await dataSource.getRepository(UserEntity).find();
		expect(users.map((u) => u.publicKey)).not.toContain('pk-late-comer');
	});

	it('cannot be used to register a second account once the invitation was already consumed', async () => {
		// This exercises the same atomic "consume exactly once" guarantee as the concurrent
		// race covered in InvitationService.spec.ts (IsNull() + affected-rows check), applied
		// here through RegistrationService's transaction. A raw two-connection sqlite
		// DataSource in a unit test cannot safely run two *overlapping* transactions (the
		// driver itself rejects nested/concurrent transactions on a single connection), so
		// this test drives the same invariant sequentially instead of via Promise.all.
		const { invitation } = await invitationService.createInvitation(admin);

		const first = await registrationService.completeRegistration({ publicKey: 'pk-first', invitation });
		expect(first.publicKey).toBe('pk-first');

		await expect(
			registrationService.completeRegistration({ publicKey: 'pk-second', invitation }),
		).rejects.toThrow();

		const users = await dataSource.getRepository(UserEntity).find();
		expect(users.map((u) => u.publicKey).sort()).toEqual(['pk-admin', 'pk-first']);
	});

	it('creates a user without touching invitations for the invitation-less setup flow', async () => {
		const user = await registrationService.completeRegistration({ publicKey: 'pk-first-admin' });
		expect(user.publicKey).toBe('pk-first-admin');
		expect(user.pseudo).toMatch(/^User \d+$/);
	});

	it('generates sequential, non-colliding pseudos across repeated registrations', async () => {
		const first = await registrationService.completeRegistration({ publicKey: 'pk-1' });
		const second = await registrationService.completeRegistration({ publicKey: 'pk-2' });
		expect(first.pseudo).not.toBe(second.pseudo);
	});
});
