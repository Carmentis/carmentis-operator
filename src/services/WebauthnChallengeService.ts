import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebauthnChallengeEntity, WebauthnChallengePurpose } from '../entities/WebauthnChallengeEntity';

const CHALLENGE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

export interface CreateChallengeParams {
	challenge: string;
	purpose: WebauthnChallengePurpose;
	userId?: number;
	pendingUserHandle?: string;
	pendingPseudo?: string;
	pendingEmail?: string;
	invitationId?: string;
}

/**
 * Persists in-flight WebAuthn challenges so that a challenge can be atomically marked
 * `consumed` exactly once. This is what makes challenge replay and concurrent double-submit
 * impossible: `consume()` only succeeds if it is the single writer that flips `consumed`
 * from false to true.
 */
@Injectable()
export class WebauthnChallengeService {
	private logger = new Logger(WebauthnChallengeService.name);

	constructor(
		@InjectRepository(WebauthnChallengeEntity)
		private readonly repository: Repository<WebauthnChallengeEntity>,
	) {}

	async create(params: CreateChallengeParams): Promise<WebauthnChallengeEntity> {
		const entity = this.repository.create({
			...params,
			consumed: false,
			expiresAt: new Date(Date.now() + CHALLENGE_VALIDITY_MS),
		});
		return this.repository.save(entity);
	}

	/**
	 * Looks up a challenge by its value and purpose, and atomically marks it consumed.
	 * Throws if the challenge is unknown, expired, or already used (including when
	 * two concurrent requests race for the same challenge: exactly one wins).
	 */
	async consume(challenge: string, purpose: WebauthnChallengePurpose): Promise<WebauthnChallengeEntity> {
		const row = await this.repository.findOne({ where: { challenge, purpose } });
		if (!row) {
			throw new BadRequestException('Unknown WebAuthn challenge');
		}
		if (row.consumed) {
			throw new BadRequestException('This WebAuthn challenge has already been used');
		}
		if (row.expiresAt.getTime() < Date.now()) {
			throw new BadRequestException('This WebAuthn challenge has expired');
		}

		const result = await this.repository.update(
			{ id: row.id, consumed: false },
			{ consumed: true },
		);
		if (result.affected !== 1) {
			throw new BadRequestException('This WebAuthn challenge has already been used');
		}

		return row;
	}

	@Cron(CronExpression.EVERY_HOUR)
	async cleanupExpired() {
		const result = await this.repository.delete({ expiresAt: LessThan(new Date()) });
		if (result.affected) {
			this.logger.debug(`Cleaned up ${result.affected} expired WebAuthn challenge(s)`);
		}
	}
}
