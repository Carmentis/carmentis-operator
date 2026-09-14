import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PasskeyService } from './PasskeyService';

describe('PasskeyService', () => {
	function buildRepository(initial: any[]) {
		const rows = [...initial];
		return {
			rows,
			find: jest.fn(async ({ where }: any) => rows.filter((r) => r.userId === where.userId)),
			count: jest.fn(async ({ where }: any) => rows.filter((r) => r.userId === where.userId).length),
			findOne: jest.fn(async ({ where }: any) => rows.find((r) => r.id === where.id) ?? null),
			create: jest.fn((data: any) => ({ id: `cred-${rows.length}`, ...data })),
			save: jest.fn(async (entity: any) => {
				const idx = rows.findIndex((r) => r.id === entity.id);
				if (idx >= 0) rows[idx] = entity;
				else rows.push(entity);
				return entity;
			}),
			remove: jest.fn(async (entity: any) => {
				const idx = rows.findIndex((r) => r.id === entity.id);
				if (idx >= 0) rows.splice(idx, 1);
			}),
		};
	}

	it('creates a credential for a user', async () => {
		const repository = buildRepository([]);
		const service = new PasskeyService(repository as any);

		const credential = await service.createForUser({
			userId: 1,
			credentialId: 'cred-id',
			publicKey: 'pub',
			counter: 0,
		});

		expect(credential.userId).toBe(1);
		expect(repository.rows).toHaveLength(1);
	});

	it('allows registering several passkeys for the same user', async () => {
		const repository = buildRepository([]);
		const service = new PasskeyService(repository as any);

		await service.createForUser({ userId: 1, credentialId: 'a', publicKey: 'pub', counter: 0 });
		await service.createForUser({ userId: 1, credentialId: 'b', publicKey: 'pub', counter: 0 });

		const list = await service.listForUser(1);
		expect(list).toHaveLength(2);
	});

	it('refuses to remove the last remaining passkey', async () => {
		const repository = buildRepository([{ id: 'only', userId: 1 }]);
		const service = new PasskeyService(repository as any);

		await expect(service.remove(1, 'only')).rejects.toThrow(BadRequestException);
	});

	it('allows removing a passkey when another one remains', async () => {
		const repository = buildRepository([
			{ id: 'first', userId: 1 },
			{ id: 'second', userId: 1 },
		]);
		const service = new PasskeyService(repository as any);

		await service.remove(1, 'first');
		expect(repository.rows).toHaveLength(1);
		expect(repository.rows[0].id).toBe('second');
	});

	it('rejects removing a passkey that does not exist', async () => {
		const repository = buildRepository([]);
		const service = new PasskeyService(repository as any);
		await expect(service.remove(1, 'missing')).rejects.toThrow(NotFoundException);
	});

	it('rejects removing a passkey owned by another user', async () => {
		const repository = buildRepository([
			{ id: 'a', userId: 1 },
			{ id: 'b', userId: 2 },
		]);
		const service = new PasskeyService(repository as any);
		await expect(service.remove(1, 'b')).rejects.toThrow(ForbiddenException);
	});
});
