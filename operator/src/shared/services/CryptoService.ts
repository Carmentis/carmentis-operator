import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { EnvService } from './EnvService';
import {
	BytesToHexEncoder,
	PrivateSignatureKey,
	PublicSignatureKey,
	Secp256k1PrivateSignatureKey,
	StringSignatureEncoder,
} from '@cmts-dev/carmentis-sdk/server';
import { randomBytes } from 'crypto';

/**
 * Service responsible for cryptographic operations in the operator.
 * Handles key pair generation, admin token creation, and node setup.
 */
@Injectable()
export class CryptoService implements OnModuleInit{
	private logger = new Logger(CryptoService.name);
	/** Flag to track if the service has been initialized */
	private static initialized = false;
	/** Token used for creating the first administrator account */
	private static _adminCreationToken : string;

	/**
	 * Creates an instance of CryptoService.
	 * @param envService - Service providing access to environment variables
	 */
	constructor(
		private readonly envService: EnvService
	) {}

	/**
	 * Gets the token required for administrator creation.
	 * @returns The administrator creation token
	 */
	get adminCreationToken(): string {
		return CryptoService._adminCreationToken;
	}

	/**
	 * Initializes the crypto service when the module is loaded.
	 * Sets up key pairs, admin token, and node connection.
	 */
	async onModuleInit() {
		if (!CryptoService.initialized) {
			CryptoService.initialized = true;
			await Promise.all([
				this.setupAdminCreationToken(),
			])
		}
	}

	/**
	 * Sets up the administrator creation token.
	 * Loads an existing token from file or generates a new one if needed.
	 * This token is required during the initial setup of the operator.
	 */
	private async setupAdminCreationToken() {
		this.logger.log("Setting up administrator creation token");

		const filePath = this.envService.adminTokenFile;
		let token = CryptoService._adminCreationToken;
		if (!token) {
			const encoder = new BytesToHexEncoder();
			token = encoder.encode(randomBytes(32));
		}

		try {
			// Check if the token file exists
			token = await fs.readFile(filePath, 'utf8');
		} catch (err) {
			// If file is not found or invalid, generate a new token
			this.logger.warn('Administrator creation token file not found or invalid, generating a new token...');
			await fs.writeFile(filePath, token);
			this.logger.log(`Generated token is saved to file ${filePath}`);
		}

		CryptoService._adminCreationToken = token;
		this.logger.log([
			'Below is shown the administrator creation token:',
			'-------------------------------------------------------------',
			`Administrator creation token location: ${filePath}`,
			`Administrator creation token: ${token}`,
			'--------------------------------------------------------------'
		].join('\n'));
	}

	/**
	 * Generates a random cryptographic key pair.
	 * @returns An object containing the private key (sk) and public key (pk)
	 */
	randomKeyPair() : { sk: PrivateSignatureKey, pk: PublicSignatureKey } {
		const sk = Secp256k1PrivateSignatureKey.gen();
		const pk = sk.getPublicKey();
		return { sk, pk };
	}

}
