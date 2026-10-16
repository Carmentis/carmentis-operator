import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
	PrivateSignatureKey,
	PublicSignatureKey,
	DigestDataHandler,
	JsonObject,
	Digest,
} from '@cmts-dev/carmentis-sdk-core';
import { BinaryEncodingUtils } from '../utils/BinaryEncodingUtils';
import { BinaryEncoding } from '../dto/signature/BinaryEncoding';

/**
 * Service responsible for cryptographic operations in the operator.
 * Handles key pair generation, admin token creation, and node setup.
 */
@Injectable()
export class CryptoService {



	async signBinary(
		sk: PrivateSignatureKey,
		encodedMessage: string,
		messageEncoding: BinaryEncoding,
		signatureEncoding: BinaryEncoding
	) {
		const message = BinaryEncodingUtils.decode(encodedMessage, messageEncoding);
		const rawSignature = await sk.sign(message);
		const signature = BinaryEncodingUtils.encode(rawSignature, signatureEncoding);
		return { signature: signature };
	}

	async verifyBinary(
		pk: PublicSignatureKey,
		message: string,
		messageEncoding: BinaryEncoding,
		signature: string,
		signatureEncoding: BinaryEncoding
	) {
		const rawMessage = BinaryEncodingUtils.decode(message, messageEncoding);
		const rawSignature = BinaryEncodingUtils.decode(signature, signatureEncoding);
		const result = await pk.verify(rawMessage, rawSignature);
		return { verified: result }
	}

	/**
	 * Converts a JSON object to a digest representation.
	 *
	 * @param {JsonObject} object - The JSON object to be processed.
	 * @param {boolean} addSalt - Indicates whether to add a salt to the digest computation for additional security.
	 * @param {string} [encoding] - Optional parameter specifying the desired encoding format for the output (e.g., 'hex', 'base64').
	 * @param {string} [digestAlg] - Optional parameter specifying the digest algorithm to use (e.g., 'sha256', 'md5').
	 * @return {string} - A string representing the computed digest of the JSON object.
	 */
	getJsonDigest(object: JsonObject, addSalt: boolean, encoding?: string, digestAlg?: string) {
		return DigestDataHandler.jsonToDigestData(object, addSalt, encoding, digestAlg);
	}

	verifyJsonDigest(digest: Digest, digestData: JsonObject) {
		return DigestDataHandler.jsonFromDigestData(digest, digestData);
	}
}
