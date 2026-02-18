import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as process from 'node:process';
import { OperatorConfigService } from '../config/services/operator-config.service';
import { mkdirSync, promises as fs } from 'fs';
import { randomBytes } from 'crypto';

/**
 * Service responsible for managing environment variables and configuration settings.
 * Provides access to file paths, encryption keys, and other environment-specific settings.
 */
@Injectable()
export class EnvService implements OnModuleInit {
	/** Path to the file containing the JWT secret */
	private _jwtSecretFile: string;
	/** Logger instance for this service */
	private logger = new Logger(EnvService.name);
	/** Key used for database encryption */
	private _dbEncryptionKey: Buffer;

	constructor(
		private readonly operatorConfig: OperatorConfigService,
	) {
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
					this.logger.warn(`Unable to read database encryption key: ${error?.message}`);
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

	async getOrCreateJwtSecret(): Promise<string> {
		// Initialize JWT token
		let specifiedJwtToken = this.operatorConfig.getJwtSecret();
		if (specifiedJwtToken && specifiedJwtToken.trim().length > 0) {
			this.logger.log("JWT secret specified in the configuration");
			return specifiedJwtToken;
		}

		this.logger.log(`JWT secret not specified in the configuration: looking at ${this._jwtSecretFile}`);
		try {
			specifiedJwtToken = await fs.readFile(this._jwtSecretFile, 'utf8');
			this.logger.log("JWT secret loaded from file");
			return specifiedJwtToken;
		} catch (error) {
			this.logger.warn(`Unable to read JWT token from file: ${error?.message}`)
			this.logger.log(`Generating new JWT token at ${this._jwtSecretFile}`)
			specifiedJwtToken = randomBytes(32).toString('hex');
			await this.storeJwtSecret(specifiedJwtToken);
			return specifiedJwtToken;
		}
	}

	private async storeJwtSecret(secret: string) {
		this.logger.log(`Storing JWT token at ${this._jwtSecretFile}`);
		await fs.writeFile(this._jwtSecretFile, secret, 'utf8');
	}
}
