import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { ChallengeEntity } from '../entities/challenge.entity';
import { bytesToHex } from '@noble/ciphers/utils';
import { Encoder } from '../../utils/encoder';
import { randomBytes } from 'crypto';
import { StringSignatureEncoder, EncoderFactory, PublicSignatureKey } from '@cmts-dev/carmentis-sdk/server';

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
		const challenge = this.challengeRepository.create({
			challenge: bytesToHex(randomBytes(32)),
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
		const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		const pk = publicKey;
		this.logger.debug(`Received publicKey: ${publicKey} (${pk.getSignatureAlgorithmId()})` );
		const encoder = EncoderFactory.defaultBytesToStringEncoder();
		this.logger.debug("Authenticating with tagged public key", signatureEncoder.encodePublicKey(pk))
		this.logger.debug("Authenticating with plain public key", encoder.encode(pk.getPublicKeyAsBytes()))
		return pk.verify(
			signatureEncoder.decodeMessage(challenge),
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