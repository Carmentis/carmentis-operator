import { join } from 'path';
import { OperatorConfig } from '../types/OperatorConfig';

export abstract class AbstractOperatorConfig {
	constructor(
		private readonly config: OperatorConfig
	) {}

	getPort(): number {
		return this.config.operator.port
	}

	getCorsConfig() {
		return this.config.operator.cors;
	}


	getDatabaseConfig() {
		const postgresConfig = this.config.operator.database.postgresql;
		const mysqlConfig = this.config.operator.database.mysql;
		const sqliteConfig = this.config.operator.database.sqlite;
		return {
			postgres: postgresConfig,
			mysql: mysqlConfig,
			sqlite: sqliteConfig,
		}
	}

	isRunningInDevMode(): boolean {
		return this.config.operator.dev;
	}


	getAdminTokenPath(): string {
		const home = this.config.operator.paths.home;
		return join(
			home,
			this.config.operator.paths.init_token
		)
	}

	getDbEncryptionKeyPath(): string {
		const home = this.config.operator.paths.home;
		return join(
			home,
			this.config.operator.paths.db_encryption_key
		);
	}

	/**
	 * Returns the Wallet Approval Protocol (WAP) configuration.
	 *
	 * This protocol is used to let the wallet approve a transaction.
	 */
	getWapConfig() {
		const wapConfig = this.config.operator.protocols.wap;
		return {
			version: wapConfig.version
		}
	}

	getSwaggerPath(): string {
		return this.config.operator.swagger.path;
	}


	/**
	 * Returns the JWT secret to use.
	 */
	getJwtSecret(): string {
		return this.config.operator.workspace.jwt.secret;
	}

	/**
	 * Returns the JWT token validity duration.
	 */
	getJwtTokenValidity(): string {
		return this.config.operator.workspace.jwt.tokenValidity;
	}

	/**
	 * Returns the JWT storage location.
	 */
	getJwtStoragePath(): string {
		const home = this.config.operator.paths.home;
		return join(
			home,
			this.config.operator.paths.jwt_secret
		);
	}

	/**
	 * Returns the configuration of the encryption layer used to encrypt sensitive information on the storage.
	 */
	getDatabaseEncryptionConfig() {
		const encryptionConfig = this.config.operator.database.encryption;
		return {
			algorithm: encryptionConfig.algorithm,
			ivLength: encryptionConfig.iv_length,
			encryptionKey: encryptionConfig.encryption_key,
		}
	}

	getNodeUrl() {
		return this.config.operator.node_url;
	}


	launchGraphQLInDebugMode() {
		return this.config.operator.workspace.graphql.debug;
	}

	getHomePath() {
		return this.config.operator.paths.home;
	}

	allowDbKeyGeneration() {
		return this.config.operator.database.encryption.allow_encryption_key_generation;
	}

}