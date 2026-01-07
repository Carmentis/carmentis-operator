import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { ChallengeEntity } from '../entities/ChallengeEntity';
import { bytesToHex } from '@noble/ciphers/utils';
import { randomBytes } from 'crypto';
import {
	EncoderFactory,
	PublicSignatureKey,
	CryptoEncoderFactory,
} from '@cmts-dev/carmentis-sdk/server';
import { base64 } from 'zod';

const CHALLENGE_VALIDITY_INTERVAL_IN_MINUTES = 3;
const CHALLENGE_VALIDITY_INTERVAL_IN_MILLISECONDS = CHALLENGE_VALIDITY_INTERVAL_IN_MINUTES * 60 * 1000;

@Injectable()
export class ChallengeService {
	private logger = new Logger('ChallengeService');
	constructor(
		@InjectRepository(ChallengeEntity)
		private readonly challengeRepository: Repository<ChallengeEntity>,
	) {
	}

	/**
	 * Creates a new challenge by generating a key, storing it in the database, and returning it.
	 */
	async createChallenge(): Promise<ChallengeEntity> {
		const validUntil =  new Date(
			new Date().getTime() + CHALLENGE_VALIDITY_INTERVAL_IN_MILLISECONDS
		);
		const b64 = EncoderFactory.bytesToBase64Encoder();
		const challenge = this.challengeRepository.create({
			challenge: b64.encode(randomBytes(32)),
			validUntil
		});
		return await this.challengeRepository.save(challenge); // Persist to the database and return the saved entity
	}

	/**
	 * Searches for a challenge in the database by its `challenge` ID.
	 */
	async findChallengeById(challengeId: string): Promise<ChallengeEntity | null> {
		return await this.challengeRepository.findOneBy({ challenge: challengeId });
	}



	async verifyChallenge(challenge: string, publicKey: PublicSignatureKey, signature: Uint8Array): Promise<boolean> {
		const challengeEntity = await this.findChallengeById(challenge);

		// Check if the challenge exists in the database
		if (!challengeEntity) {
			return false;
		}

		// Check if the challenge is still valid
		if ( challengeEntity.validUntil < new Date()) {
			return false;
		}

		// Verify the signature authenticity using the public key
		const signatureEncoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		const pk = publicKey;
		this.logger.debug(`Auth attempt with public key: ${await signatureEncoder.encodePublicKey(pk)}`)
		const b64 = EncoderFactory.bytesToBase64Encoder();
		return pk.verify(
			b64.decode(challenge),
			signature,
		)
	}


	/**
	 * Deletes a challenge from the repository based on the provided identifier.
	 *
	 * @param {string} challenge - The unique identifier of the challenge to be deleted.
	 * @return {Promise<boolean>} A promise that resolves to `true` if the challenge was successfully deleted, or `false` if the challenge was not found.
	 */
	async deleteChallenge(challenge: string): Promise<boolean> {
		const challengeEntity = await this.findChallengeById( challenge );

		if (!challengeEntity) {
			return false;
		}

		await this.challengeRepository.remove(challengeEntity);
		return true;
	}


	/**
	 * Deletes challenges that are outdated based on their validity interval.
	 *
	 * @param batchLimit The size of batch of challenges that should be deleted (used to prevent deletion of too much challenges at a time).
	 *
	 * @return {Promise<number>} The number of challenges deleted.
	 */
	async deleteOutdatedChallenges(batchLimit: number = 100): Promise<number> {
		let totalDeletedChallenges = 0;
		let isDeletingOutdatedChallenge = true;
		do {
			// Find all challenges that are outdated
			const outdatedChallenges = await this.challengeRepository.find({
				where: {
					validUntil: LessThan(new Date()),
				},
				take: batchLimit
			});

			// Delete all outdated challenges
			if (outdatedChallenges.length > 0) {
				// delete the challenges
				this.logger.verbose(`Deleting ${outdatedChallenges.length} outdated challenges`);
				await this.challengeRepository.remove(outdatedChallenges);

				// update the total number of deleted challenges
				totalDeletedChallenges += outdatedChallenges.length;
			} else {
				isDeletingOutdatedChallenge = false;
			}
		} while (isDeletingOutdatedChallenge);


		return totalDeletedChallenges;
	}
}