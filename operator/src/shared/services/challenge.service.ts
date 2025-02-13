import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { ChallengeEntity } from '../entities/challenge.entity';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
import { Encoder } from '../../utils/encoder';

const CHALLENGE_VALIDITY_INTERVAL_IN_MINUTES = 3;
const CHALLENGE_VALIDITY_INTERVAL_IN_MILLISECONDS = CHALLENGE_VALIDITY_INTERVAL_IN_MINUTES * 60 * 1000;

@Injectable()
export class ChallengeService {
	constructor(
		@InjectRepository(ChallengeEntity)
		private readonly challengeRepository: Repository<ChallengeEntity>,
	) {
	}

	/**
	 * Creates a new challenge by generating a key, storing it in the database, and returning it.
	 */
	async createChallenge(): Promise<ChallengeEntity> {
		const generatedKey = sdk.crypto.generateKey256(); // Generate a 256-bit key
		const validUntil =  new Date(
			new Date().getTime() + CHALLENGE_VALIDITY_INTERVAL_IN_MILLISECONDS
		);
		const challenge = this.challengeRepository.create({
			challenge: generatedKey,
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


	/**
	 * Verifies a challenge using the provided public key and signature.
	 * A challenge is valid if:
	 * 1. The challenge exists in the database.
	 * 2. The `validUntil` field  is higher or equal than the current time.
	 * 3. The signature with the provided public key authenticates the challenge.
	 */
	async verifyChallenge(challenge: string, publicKey: string, signature: string): Promise<boolean> {
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
		const isVerified = sdk.crypto.secp256k1.verify(
			publicKey,
			Encoder.FromHexa(challenge),
			signature,
		);

		return isVerified;
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
	 * @return {Promise<number>} The number of challenges deleted.
	 */
	async deleteOutdatedChallenges(): Promise<number> {
		// Find all challenges that are outdated
		const outdatedChallenges = await this.challengeRepository.find({
			where: {
				validUntil: LessThan(new Date()),
			},
		});

		// Delete all outdated challenges
		if (outdatedChallenges.length > 0) {
			await this.challengeRepository.remove(outdatedChallenges);
		}

		return outdatedChallenges.length;
	}
}