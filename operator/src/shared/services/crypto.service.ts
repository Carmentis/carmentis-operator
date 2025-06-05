import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
import { promises as fs } from 'fs';
import { EnvService } from './env.service';

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
			Promise.all([
				this.setupOperatorKeyPair(),
				this.setupAdminCreationToken(),
				this.setupNode()
			])
		}
	}

	/**
	 * Sets up the operator's cryptographic key pair.
	 * Loads existing keys from file or generates new ones if needed.
	 */
	private async setupOperatorKeyPair() {
		this.logger.log("Setting up the operator key pair");

		const keyPairFilePath = this.envService.operatorKeyPairFile;
		let operatorPrivateKey = sdk.crypto.generateKey256();
		let operatorPublicKey = sdk.crypto.secp256k1.publicKeyFromPrivateKey(operatorPrivateKey);
		try {
			// Check if the key pair file exists
			const keyPairFile = await fs.readFile(keyPairFilePath, 'utf8');
			const { privateKey, publicKey } = JSON.parse(keyPairFile);

			if (privateKey && publicKey) {
				this.logger.log('Loaded existing key pair from file');
				operatorPrivateKey = privateKey;
				operatorPublicKey = publicKey;
			} else {
				throw new Error('Invalid key pair file, generating a new pair...');
			}
		} catch (err) {
			// If file is not found or invalid, generate a new key pair
			this.logger.warn('Key pair file not found or invalid, generating a new pair...');

			const keyPair = JSON.stringify(
				{
					privateKey: operatorPrivateKey,
					publicKey: operatorPublicKey,
				},
				null,
				2,
			);

			await fs.writeFile(keyPairFilePath, keyPair);
			this.logger.log(`New key pair generated and saved to file ${keyPairFilePath}`);
		}
	}


	/**
	 * Sets up the connection to the blockchain node.
	 * Configures the operator to communicate with the specified node URL.
	 */
	private async setupNode() {
		const nodeUrl = process.env.NODE_URL;
		this.logger.log(`Linking operator api with node located at ${nodeUrl}`);
		// Note: Additional node setup logic would be implemented here
	}

	/**
	 * Sets up the administrator creation token.
	 * Loads an existing token from file or generates a new one if needed.
	 * This token is required during the initial setup of the operator.
	 */
	private async setupAdminCreationToken() {
		this.logger.log("Setting up administrator creation token");

		let filePath = this.envService.adminTokenFile;
		let token = CryptoService._adminCreationToken;
		if (!token) {
			token = sdk.utils.encoding.toHexa(sdk.crypto.getRandomBytes(32));
		}

		try {
			// Check if the token file exists
			token = await fs.readFile(filePath, 'utf8');
		} catch (err) {
			// If file is not found or invalid, generate a new token
			this.logger.warn('Administrator creation token file not found or invalid, generating a new token...');
			await fs.writeFile(this.envService.adminTokenFile, token);
			this.logger.log(`Generated token is saved to file ${this.envService.adminTokenFile}`);
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
	randomKeyPair() {
		const sk = sdk.crypto.secp256k1.randomPrivateKey();
		const pk = sdk.crypto.secp256k1.publicKeyFromPrivateKey(sk);
		return { sk, pk };
	}

	/**
	 * Validates if a string is a valid private key.
	 * @param privateKey - The private key to validate
	 * @returns A boolean indicating if the private key is valid
	 * @todo Implement actual validation logic
	 */
	async isValidPrivateKey(privateKey: string) {
		// TODO: Implement proper validation logic
		return true;
	}

	/**
	 * Derives a public key from a private key.
	 * @param privateKey - The private key to derive from
	 * @returns The corresponding public key
	 */
	async publicKeyFromPrivateKey(privateKey: string) {
		return sdk.crypto.secp256k1.publicKeyFromPrivateKey(privateKey);
	}
}
