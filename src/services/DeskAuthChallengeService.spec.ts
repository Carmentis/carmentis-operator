import { BadRequestException } from '@nestjs/common';
import { DeskAuthChallengeService } from './DeskAuthChallengeService';

describe('DeskAuthChallengeService', () => {
	function buildRepository(initial: any[]) {
		const rows = [...initial];
		return {
			create: (data: any) => ({ id: `id-${rows.length}`, consumed: false, ...data }),
			save: jest.fn(async (entity: any) => {
				const existingIndex = rows.findIndex((row) => row.id === entity.id);
				if (existingIndex >= 0) rows[existingIndex] = entity;
				else rows.push(entity);
				return entity;
			}),
			findOne: jest.fn(async ({ where }: any) => {
				return rows.find((row) => row.challenge === where.challenge) ?? null;
			}),
			// Simulates an atomic conditional UPDATE: only succeeds if `consumed` still matches `where.consumed`.
			update: jest.fn(async (where: any, patch: any) => {
				const row = rows.find((r) => r.id === where.id);
				if (!row || row.consumed !== where.consumed) {
					return { affected: 0 };
				}
				Object.assign(row, patch);
				return { affected: 1 };
			}),
			delete: jest.fn(async () => ({ affected: 0 })),
		};
	}

	it('creates a challenge with a 5 minute expiry', async () => {
		const repository = buildRepository([]);
		const service = new DeskAuthChallengeService(repository as any);

		const before = Date.now();
		const row = await service.create('abc');
		expect(row.expiresAt.getTime()).toBeGreaterThan(before);
		expect(row.expiresAt.getTime()).toBeLessThanOrEqual(before + 5 * 60 * 1000 + 1000);
	});

	it('consumes a fresh challenge exactly once', async () => {
		const repository = buildRepository([]);
		const service = new DeskAuthChallengeService(repository as any);
		await service.create('abc');

		const consumed = await service.consume('abc');
		expect(consumed.challenge).toBe('abc');

		await expect(service.consume('abc')).rejects.toThrow(BadRequestException);
	});

	it('rejects an unknown challenge', async () => {
		const repository = buildRepository([]);
		const service = new DeskAuthChallengeService(repository as any);
		await expect(service.consume('does-not-exist')).rejects.toThrow(BadRequestException);
	});

	it('rejects an expired challenge', async () => {
		const repository = buildRepository([]);
		const service = new DeskAuthChallengeService(repository as any);
		const row = await service.create('abc');
		row.expiresAt = new Date(Date.now() - 1000);

		await expect(service.consume('abc')).rejects.toThrow(BadRequestException);
	});

	it('only lets one of two concurrent consume attempts succeed (replay protection)', async () => {
		const repository = buildRepository([]);
		const service = new DeskAuthChallengeService(repository as any);
		await service.create('race');

		const results = await Promise.allSettled([
			service.consume('race'),
			service.consume('race'),
		]);

		const fulfilled = results.filter((r) => r.status === 'fulfilled');
		const rejected = results.filter((r) => r.status === 'rejected');
		expect(fulfilled).toHaveLength(1);
		expect(rejected).toHaveLength(1);
	});
});
