import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as process from 'node:process';
import { OperatorConfigService } from '../../config/services/operator-config.service';
import { mkdirSync, promises as fs } from 'fs';
import { randomBytes } from 'crypto';

/**
 * Service responsible for managing environment variables and configuration settings.
 * Provides access to file paths, encryption keys, and other environment-specific settings.
 */
@Injectable()
export class EnvService implements OnModuleInit {
	/** Path to the file containing the administrator creation token */
	private _adminTokenFile: string;
	/** Path to the file containing the JWT secret */
	private _jwtSecretFile: string;
	/** URL of the blockchain node */
	private _nodeUrl: string;
	/** Logger instance for this service */
	private logger = new Logger(EnvService.name);
	/** Key used for database encryption */
	private _dbEncryptionKey: Buffer;

	constructor(
		private readonly operatorConfig: OperatorConfigService,
	) {
		// Get the blockchain node URL
		this._nodeUrl = this.operatorConfig.getNodeUrl(); //this.configService.getOrThrow<string>('NODE_URL');
		this._adminTokenFile = this.operatorConfig.getAdminTokenPath();
		this._jwtSecretFile = this.operatorConfig.getJwtStoragePath();

		// create home directory if not exists
		const home = this.operatorConfig.getHomePath();
		mkdirSync(home, {
			recursive: true,
		});
	}

	/**
	 * Lifecycle hook that runs when the module is initialized.
	 * Currently empty but can be used for additional initialization logic.
	 */
	async onModuleInit() {
		// Initialize admin token file path
		const adminTokenPath = this.operatorConfig.getAdminTokenPath();
		if (typeof adminTokenPath === 'string') {
			this._adminTokenFile = adminTokenPath;
			this.logger.log(`Admin token file provided: ${this._adminTokenFile}`);
		} else {
			this._adminTokenFile = path.join(process.cwd(), './admin-token.txt');
			this.logger.log(`No admin token file provided (default: ${this._adminTokenFile}).`);
		}

		// Initialize database encryption key
		const databaseEncryptionConfig = this.operatorConfig.getDatabaseEncryptionConfig();
		const specifiedEncryptionKey = databaseEncryptionConfig.encryptionKey;
		const databaseEncryptionKeyPath = this.operatorConfig.getDbEncryptionKeyPath();
		let dbEncryptionKey: string;
		if (specifiedEncryptionKey) {
			this.logger.log("Database encryption key specified in config file.")
			dbEncryptionKey = specifiedEncryptionKey;
		} else {
			if (databaseEncryptionKeyPath) {
				this.logger.log(`Database encryption key not specified in config file: looking at ${databaseEncryptionKeyPath}.`)
				try {
					dbEncryptionKey = await fs.readFile(databaseEncryptionKeyPath, 'utf8');
				} catch (error) {
					this.logger.warn("Unable to read database encryption key:", error);
					if (this.operatorConfig.allowDbKeyGeneration()) {
						this.logger.log("Generating database encryption key.")
						dbEncryptionKey = randomBytes(32).toString('hex');
					} else {
						const errorMessage = "No specified database encryption key and generation disabled.";
						this.logger.error(errorMessage);
						throw new Error(errorMessage);
					}
				}
			} else {
				throw new Error('No database encryption key specified in config file and unable to read it from file.');
			}
		}

		// export the database encryption key
		this.logger.log(`Database encryption key exported: ${databaseEncryptionKeyPath}`);
		await fs.writeFile(databaseEncryptionKeyPath, dbEncryptionKey);

		this._dbEncryptionKey = Buffer.from(
			dbEncryptionKey,
			'hex'
		);
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
	 * Gets the path to the file containing the administrator creation token.
	 * @returns The file path as a string
	 */
	get adminTokenFile(): string {
		return this._adminTokenFile;
	}

	async getOrCreateJwtSecret() {
		// Initialize JWT token
		let specifiedJwtToken = this.operatorConfig.getJwtSecret();
		if (specifiedJwtToken) {
			this.logger.log("JWT secret specified in the configuration");
		} else {
			this.logger.log(`JWT secret not specified in the configuration: looking at ${this._jwtSecretFile}`);
			try {
				specifiedJwtToken = await fs.readFile(this._jwtSecretFile, 'utf8');
			} catch (error) {
				this.logger.warn(`Unable to read JWT token from file: ${error}`)
				this.logger.log(`Generating new JWT token at ${this._jwtSecretFile}`)
				specifiedJwtToken = randomBytes(32).toString('hex');
			}
		}
		return specifiedJwtToken;
	}

	async storeJwtSecret(secret: string) {
		this.logger.log(`Exporting JWT token at ${this._jwtSecretFile}`);
		await fs.writeFile(this._jwtSecretFile, secret, 'utf8');
	}
}
