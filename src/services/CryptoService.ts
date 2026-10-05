import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { EnvService } from './EnvService';
import {
	BytesToHexEncoder,
	PrivateSignatureKey,
	PublicSignatureKey,
	Secp256k1PrivateSignatureKey,
	CryptoEncoderFactory,
} from '@cmts-dev/carmentis-sdk-core';
import { randomBytes } from 'crypto';
import { BinaryEncodingUtils } from '../utils/BinaryEncodingUtils';
import { BinaryEncoding } from '../dto/signature/BinaryEncoding';

/**
 * Service responsible for cryptographic operations in the operator.
 * Handles key pair generation, admin token creation, and node setup.
 */
@Injectable()
export class CryptoService implements OnModuleInit{
	private logger = new Logger(CryptoService.name);


	/**
	 * Creates an instance of CryptoService.
	 * @param envService - Service providing access to environment variables
	 */
	constructor(
		private readonly envService: EnvService
	) {}


	/**
	 * Initializes the crypto service when the module is loaded.
	 * Sets up key pairs, admin token, and node connection.
	 */
	async onModuleInit() {

	}


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
}
