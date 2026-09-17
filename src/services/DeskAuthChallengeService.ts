import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeskAuthChallengeEntity } from '../entities/DeskAuthChallengeEntity';

const CHALLENGE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Persists in-flight Carmentis Desk auth challenges so that a challenge can be atomically
 * marked `consumed` exactly once. This is what makes challenge replay and concurrent
 * double-submit impossible: `consume()` only succeeds if it is the single writer that flips
 * `consumed` from false to true.
 */
@Injectable()
export class DeskAuthChallengeService {
	private logger = new Logger(DeskAuthChallengeService.name);

	constructor(
		@InjectRepository(DeskAuthChallengeEntity)
		private readonly repository: Repository<DeskAuthChallengeEntity>,
	) {}

	async create(challenge: string): Promise<DeskAuthChallengeEntity> {
		const entity = this.repository.create({
			challenge,
			consumed: false,
			expiresAt: new Date(Date.now() + CHALLENGE_VALIDITY_MS),
		});
		return this.repository.save(entity);
	}

	/**
	 * Looks up a challenge by its value and atomically marks it consumed. Throws if the
	 * challenge is unknown, expired, or already used (including when two concurrent requests
	 * race for the same challenge: exactly one wins).
	 */
	async consume(challenge: string): Promise<DeskAuthChallengeEntity> {
		const row = await this.repository.findOne({ where: { challenge } });
		if (!row) {
			throw new BadRequestException('Unknown Carmentis Desk challenge');
		}
		if (row.consumed) {
			throw new BadRequestException('This challenge has already been used');
		}
		if (row.expiresAt.getTime() < Date.now()) {
			throw new BadRequestException('This challenge has expired');
		}

		const result = await this.repository.update(
			{ id: row.id, consumed: false },
			{ consumed: true },
		);
		if (result.affected !== 1) {
			throw new BadRequestException('This challenge has already been used');
		}

		return row;
	}

	@Cron(CronExpression.EVERY_HOUR)
	async cleanupExpired() {
		const result = await this.repository.delete({ expiresAt: LessThan(new Date()) });
		if (result.affected) {
			this.logger.debug(`Cleaned up ${result.affected} expired Desk auth challenge(s)`);
		}
	}
}
