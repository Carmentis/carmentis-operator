import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { EnvService } from './EnvService';
import {
	BytesToHexEncoder,
	PrivateSignatureKey,
	PublicSignatureKey,
	Secp256k1PrivateSignatureKey,
	CryptoEncoderFactory,
} from '@cmts-dev/carmentis-sdk/server';
import { randomBytes } from 'crypto';

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

}
