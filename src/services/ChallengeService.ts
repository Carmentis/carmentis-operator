import { Injectable, Logger } from '@nestjs/common';
import { createHmac, randomBytes } from 'crypto';
import { EnvService } from './EnvService';

export interface ChallengeData {
	challenge: string;
	mac: string;
	expiresAt: Date;
}

/**
 * Stateless challenge service using MAC for authentication
 * No database storage required - challenge authenticity is verified via HMAC
 */
@Injectable()
export class ChallengeService {
	private logger = new Logger(ChallengeService.name);
	private readonly CHALLENGE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

	private readonly hmacSecret: string;
	constructor(private readonly envService: EnvService) {
		this.logger.log('Generating new HMAC secret for challenge verification...');
		this.hmacSecret = randomBytes(32).toString('hex');
	}

	/**
	 * Generates a new challenge with MAC authentication
	 * @returns Challenge data with challenge string, MAC, and expiration time
	 */
	generateChallenge(): ChallengeData {
		// Generate random challenge
		const challenge = randomBytes(32).toString('hex');

		// Calculate expiration time
		const expiresAt = new Date(Date.now() + this.CHALLENGE_VALIDITY_MS);

		// Generate MAC using HMAC-SHA256
		const mac = this.generateMAC(challenge, expiresAt);

		this.logger.debug(`Generated challenge: ${challenge}, expires at: ${expiresAt}`);

		return {
			challenge,
			mac,
			expiresAt,
		};
	}

	/**
	 * Verifies a challenge by checking its MAC and expiration
	 * @param challenge The challenge string
	 * @param mac The MAC tag to verify
	 * @param expiresAt The expiration timestamp from the original challenge
	 * @throws Error if challenge is expired or MAC doesn't match
	 */
	verifyChallenge(challenge: string, mac: string, expiresAt: Date): void {
		// Check if challenge is expired
		if (new Date() > expiresAt) {
			throw new Error('Challenge has expired');
		}

		// Verify MAC
		const expectedMac = this.generateMAC(challenge, expiresAt);
		if (mac !== expectedMac) {
			throw new Error('Invalid MAC - challenge authenticity verification failed');
		}

		this.logger.debug(`Challenge verified successfully: ${challenge}`);
	}

	/**
	 * Generates a MAC (Message Authentication Code) for a challenge
	 * Uses HMAC-SHA256 with the JWT secret as the key
	 * @param challenge The challenge string
	 * @param expiresAt The expiration timestamp
	 * @returns The MAC as a hex string
	 */
	private generateMAC(challenge: string, expiresAt: Date): string {
		const secret = this.hmacSecret;
		const data = `${challenge}:${expiresAt.toISOString()}`;
		return createHmac('sha256', secret)
			.update(data)
			.digest('hex');
	}


}
