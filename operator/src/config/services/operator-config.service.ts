import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigSchema, OperatorConfig } from '../types/OperatorConfig';
import process from 'node:process';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as toml from '@iarna/toml';

@Injectable()
export class OperatorConfigService {
    private config: OperatorConfig;
    private logger = new Logger(OperatorConfigService.name);

    constructor() {
        this.loadConfigFile()
    }

    private loadConfigFile() {
        // for resilience, we search through multiple possible config files.
        // Some filenames might be undefined due to access to env variables that might be undefined./
        const candidatesConfigFilenames: (string | undefined)[] = [
            'config.toml',
            'operator-config.toml',
            'config-operator.toml',
            process.env['CONFIG_FILENAME'],
            process.env['OPERATOR_CONFIG_FILENAME'],
			process.env['CONFIG_OPERATOR_FILENAME'],
        ];

        // we construct the candidates config file paths.
        // Be aware that the order of candidates is important since we accept the first valid one, other are ignored.
        const candidatesConfigFilePaths = [];

        // At the top priority, we check if the user has specified a config file path using an environment variable.
        const specifiedConfigPath = process.env['CONFIG'] || process.env['OPERATOR_CONFIG'] || undefined;
        if (specifiedConfigPath !== undefined) {
            candidatesConfigFilePaths.push(specifiedConfigPath);
        }


        // we exclude undefined filenames and appends the current working directory to each filename.
        const currentWorkDirectory = process.cwd();
        const filteredCurrentDirectoryCandidatesPaths = candidatesConfigFilenames
            .filter((filename) => filename !== undefined)
            .map((filename) => join(currentWorkDirectory, filename));
        candidatesConfigFilePaths.push(...filteredCurrentDirectoryCandidatesPaths);


        // we now search for the first config file that exists.
        for (const configPath of candidatesConfigFilePaths) {
            try {
                this.logger.log(`Loading config file from ${configPath}`);
                const config = readFileSync(configPath, 'utf8');
                const parsedConfig = toml.parse(config) as Record<string, any>;
                this.config = ConfigSchema.parse(parsedConfig);
                return;
            } catch (e) {
                if (e instanceof Error) {
                    this.logger.warn(`Failed to load config file from ${configPath}: ${e.message}`);
                }
            }
        }

        // if we reach this point, we have not found a valid config file.
        // we throw an error.
        const formattedSearchedCandidates = candidatesConfigFilePaths.join(', ');
        throw new Error(`Failed to load config file from any of the following paths: ${formattedSearchedCandidates}`);
    }


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