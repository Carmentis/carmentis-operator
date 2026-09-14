import { DataSource } from 'typeorm';
import { GoneException, NotFoundException } from '@nestjs/common';
import { InvitationEntity } from '../entities/InvitationEntity';
import { UserEntity } from '../entities/UserEntity';
import { UserCredentialEntity } from '../entities/UserCredentialEntity';
import { InvitationService } from './InvitationService';

describe('InvitationService', () => {
	let dataSource: DataSource;
	let service: InvitationService;
	let admin: UserEntity;

	beforeEach(async () => {
		dataSource = new DataSource({
			type: 'sqlite',
			database: ':memory:',
			synchronize: true,
			entities: [UserEntity, UserCredentialEntity, InvitationEntity],
		});
		await dataSource.initialize();

		const userRepository = dataSource.getRepository(UserEntity);
		admin = await userRepository.save(userRepository.create({ pseudo: 'admin' }));

		const config = { getInvitationExpirySeconds: () => 86400 } as any;
		service = new InvitationService(dataSource.getRepository(InvitationEntity), config);
	});

	afterEach(async () => {
		await dataSource.destroy();
	});

	it('validates a freshly created invitation as pending, not used', async () => {
		const { token, invitation } = await service.createInvitation(admin);
		expect(invitation.usedAt).toBeNull();
		expect(service.getStatus(invitation)).toBe('pending');

		const validated = await service.validateToken(token);
		expect(validated.id).toBe(invitation.id);
	});

	it('rejects an unknown token', async () => {
		await expect(service.validateToken('does-not-exist')).rejects.toThrow(NotFoundException);
	});

	it('rejects an expired invitation', async () => {
		const shortLivedConfig = { getInvitationExpirySeconds: () => -1 } as any;
		const shortLivedService = new InvitationService(dataSource.getRepository(InvitationEntity), shortLivedConfig);
		const { token } = await shortLivedService.createInvitation(admin);

		await expect(shortLivedService.validateToken(token)).rejects.toThrow(GoneException);
	});

	it('does not mark an invitation as used merely by validating it (opening the link)', async () => {
		const { token, invitation } = await service.createInvitation(admin);
		await service.validateToken(token);
		await service.validateToken(token);
		await service.validateToken(token);

		const reloaded = await dataSource.getRepository(InvitationEntity).findOneBy({ id: invitation.id });
		expect(reloaded.usedAt).toBeNull();
	});

	it('marks an invitation as used once consumed, and rejects it afterwards', async () => {
		const { token, invitation } = await service.createInvitation(admin);
		const newUserRepository = dataSource.getRepository(UserEntity);
		const newUser = await newUserRepository.save(newUserRepository.create({ pseudo: 'invitee' }));

		await service.consumeInvitation(invitation, newUser);

		await expect(service.validateToken(token)).rejects.toThrow(GoneException);
		const reloaded = await dataSource.getRepository(InvitationEntity).findOneBy({ id: invitation.id });
		expect(reloaded.usedAt).not.toBeNull();
		expect(reloaded.usedByUserId).toBe(newUser.id);
	});

	it('only lets one of two concurrent consumption attempts succeed (single-use under race)', async () => {
		const { invitation } = await service.createInvitation(admin);
		const userRepository = dataSource.getRepository(UserEntity);
		const userA = await userRepository.save(userRepository.create({ pseudo: 'a' }));
		const userB = await userRepository.save(userRepository.create({ pseudo: 'b' }));

		const results = await Promise.allSettled([
			service.consumeInvitation(invitation, userA),
			service.consumeInvitation(invitation, userB),
		]);

		const fulfilled = results.filter((r) => r.status === 'fulfilled');
		const rejected = results.filter((r) => r.status === 'rejected');
		expect(fulfilled).toHaveLength(1);
		expect(rejected).toHaveLength(1);
	});

	it('lists invitations created by a user with their computed status', async () => {
		await service.createInvitation(admin);
		const list = await service.listForUser(admin.id);
		expect(list).toHaveLength(1);
		expect(service.getStatus(list[0])).toBe('pending');
	});
});
