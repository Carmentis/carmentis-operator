import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigSchema, OperatorConfig } from '../types/OperatorConfig';
import process from 'node:process';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as toml from '@iarna/toml';
import { AbstractOperatorConfig } from './abstract-operator-config';

@Injectable()
export class OperatorConfigService extends AbstractOperatorConfig {
    private static logger = new Logger(OperatorConfigService.name);

    constructor() {
		super(OperatorConfigService.loadConfigFile());
    }

    private static loadConfigFile() {
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
                return ConfigSchema.parse(parsedConfig);
            } catch (e) {
                if (e instanceof Error) {
                    this.logger.warn(`Failed to load config file from ${configPath}: ${e.message}`);
                }
            }
        }

        // if we reach this point, we have not found a valid config file.
        // we finally attempt to create an empty configuration.
        try {
            this.logger.log("No configuration found: Attempting to create default config")
            const defaultConfig = ConfigSchema.parse({
                operator: {}
            });
            return defaultConfig;
        } catch (e) {
            if (e instanceof Error) {
                this.logger.error(`Failed to create default config: ${e.message}`);
            }
            const formattedSearchedCandidates = candidatesConfigFilePaths.join(', ');
            throw new Error(`Failed to load config file from any of the following paths: ${formattedSearchedCandidates}`);

        }
    }


}