import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as process from 'node:process';

/**
 * Service responsible for managing environment variables and configuration settings.
 * Provides access to file paths, encryption keys, and other environment-specific settings.
 */
@Injectable()
export class EnvService implements OnModuleInit {
	/** Path to the file containing the administrator creation token */
	private _adminTokenFile: string;
	/** Path to the file containing the operator's cryptographic key pair */
	private _operatorKeyPairFile: string;
	/** URL of the blockchain node */
	private _nodeUrl: string;
	/** Logger instance for this service */
	private logger = new Logger(EnvService.name);
	/** Key used for database encryption */
	private _dbEncryptionKey: Buffer;

	/**
	 * Creates an instance of EnvService.
	 * Initializes configuration values from environment variables or sets defaults.
	 * @param configService - Service for accessing configuration values
	 */
	constructor(
		private readonly configService: ConfigService
	) {
		// Get the blockchain node URL
		this._nodeUrl = this.configService.getOrThrow<string>('NODE_URL');

		// Initialize database encryption key
		this._dbEncryptionKey = Buffer.from(
			this.configService.getOrThrow<string>('OPERATOR_DB_ENCRYPTION_KEY'),
			'hex'
		);

		// Initialize operator keypair file path
		try {
			this._operatorKeyPairFile = this.configService.getOrThrow<string>('OPERATOR_KEYPAIR_FILE');
			this.logger.log(`Operator keypair file provided: ${this._operatorKeyPairFile}`);
		} catch {
			this._operatorKeyPairFile = path.join(process.cwd(), './operator-keypair.json');
			this.logger.log(`No operator keypair file provided (default: ${this._operatorKeyPairFile}).`);
		}

		// Initialize admin token file path
		try {
            this._adminTokenFile = this.configService.getOrThrow<string>('OPERATOR_ADMIN_TOKEN_FILE');
            this.logger.log(`Admin token file provided: ${this._adminTokenFile}`);
        } catch {
            this._adminTokenFile = path.join(process.cwd(), './admin-token.txt');
            this.logger.log(`No admin token file provided (default: ${this._adminTokenFile}).`);
        }
	}

	/**
	 * Lifecycle hook that runs when the module is initialized.
	 * Currently empty but can be used for additional initialization logic.
	 */
	onModuleInit(): void {
		// Additional initialization logic can be added here if needed
	}

	/**
	 * Gets the key used for database encryption.
	 * @returns The database encryption key as a Buffer
	 */
	get dbEncryptionKey(): Buffer {
		return this._dbEncryptionKey;
	}

	/**
	 * Gets the URL of the blockchain node.
	 * @returns The node URL as a string
	 */
	get nodeUrl(): string {
		return this._nodeUrl;
	}

	/**
	 * Gets the path to the file containing the operator's key pair.
	 * @returns The file path as a string
	 */
	get operatorKeyPairFile(): string {
		return this._operatorKeyPairFile;
	}

	/**
	 * Gets the path to the file containing the administrator creation token.
	 * @returns The file path as a string
	 */
	get adminTokenFile(): string {
		return this._adminTokenFile;
	}
}
