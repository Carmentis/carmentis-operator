import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CryptoEncoderFactory, PublicSignatureKey } from '@cmts-dev/carmentis-sdk-core';
import { canonicalize } from 'json-canonicalize';
import { DeskAuthChallengeService } from './DeskAuthChallengeService';
import { DeskAuthVerifyDto } from '../dto/DeskAuthVerifyDto';
import { encodeAuthChallengeRequest } from '../utils/DeskWalletRequestUtils';
import { BinaryEncodingUtils } from '../utils/BinaryEncodingUtils';
import { BinaryEncoding } from '../dto/signature/BinaryEncoding';

/**
 * Drives the server side of a Carmentis Desk `wr-auth-pk` exchange: issue a random challenge,
 * then cryptographically verify that the response really was produced by the wallet holding the
 * claimed public key. The public key alone (as sent by the client) never suffices to
 * authenticate — it only becomes trustworthy once `verifySignedChallenge` confirms the matching
 * private key signed this exact, single-use challenge.
 */
@Injectable()
export class CarmentisDeskAuthService {
	constructor(
		private readonly challenges: DeskAuthChallengeService
	) {}

	async startChallenge(): Promise<{ challenge: string }> {
		const challenge = randomBytes(32).toString('base64');
		await this.challenges.create(challenge);
		return { challenge };
	}

	/**
	 * Consumes the challenge (throwing if it is unknown, expired, or already used) and verifies
	 * that `signature` is a valid signature, by `publicKey`, over the `wr-auth-pk` request for
	 * this challenge. Returns the caller-supplied public key string once verified, so it can be
	 * used as the durable account identifier.
	 */
	async verifySignedChallenge(dto: DeskAuthVerifyDto): Promise<string> {
		await this.challenges.consume(dto.challenge);

		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		const publicKey = await encoder.decodePublicKey(dto.publicKey);
		const verified = await this.verifyCanonicalJsonPayload(publicKey, dto.payload, dto.signature);


		/*
		const message = encodeAuthChallengeRequest(dto.challenge);
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		const publicKey = await encoder.decodePublicKey(dto.publicKey);
		const signature = encoder.decodeSignature(dto.signature);

		const verified = await publicKey.verify(message, signature);

		 */
		if (!verified) {
			throw new UnauthorizedException('Invalid Carmentis Desk signature');
		}

		return dto.publicKey;
	}

	/**
	 * Carmentis Desk (`sigMethod: 'canonical-json'`) signs the bare RFC 8785 canonical form of
	 * the auth payload, with a base64 signature. This is the Desk wire protocol, not the
	 * operator's JSON signature API (which uses the SDK's contextual `JsonSignature`).
	 */
	private async verifyCanonicalJsonPayload(publicKey: PublicSignatureKey, payload: object, signature: string) {
		const rawPayload = new TextEncoder().encode(canonicalize(payload));
		const rawSignature = BinaryEncodingUtils.decode(signature, BinaryEncoding.BASE64);
		return publicKey.verify(rawPayload, rawSignature);
	}
}
