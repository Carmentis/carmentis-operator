import { OperatorConfigService } from '../config/services/operator-config.service';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

const entitiesLocation = __dirname + '/../**/*Entity{.ts,.js}';

export function getDatabaseConfig(config: OperatorConfigService): DataSourceOptions {
	// get the database configuration.
	const databaseConfig = config.getDatabaseConfig();

	// create a logger to help user identifying chosen driver
	const logger = new Logger('DatabaseConfig');

	// we specify common parameters values
	const runningInDev = config.isRunningInDevMode();
	const synchronize = runningInDev;
	const migrationsRun = false;
	const migrations = ['src/**/migrations/**.ts'];

	// log config
	const runningMode = runningInDev ? 'dev' : 'production';
	logger.log(`Running in ${runningMode}`);
	logger.log(`Synchronization enabled? ${synchronize}`);
	logger.log(`Automatic migrations enabled? ${migrationsRun}`);

	// check if the postgres config is defined
	if (databaseConfig.postgres) {
		logger.log('Postgres driver chosen.')
		const postgresConfig = databaseConfig.postgres;
		return {
			entities: [entitiesLocation],
			synchronize,
			migrationsRun,
			migrations,
			type: 'postgres',
			host: postgresConfig.url, //configService.getOrThrow<string>('OPERATOR_POSTGRES_URL'),
			port: postgresConfig.port, //configService.getOrThrow<number>('OPERATOR_POSTGRES_PORT'),
			username: postgresConfig.user, //configService.getOrThrow<string>('OPERATOR_POSTGRES_USER'),
			password: postgresConfig.password, //configService.getOrThrow<string>('OPERATOR_POSTGRES_PASSWORD'),
			database: postgresConfig.database, //configService.getOrThrow<string>('OPERATOR_POSTGRES_DB'),
		}
	}


	if (databaseConfig.mysql) {
		logger.log('Mysql driver chosen.')
		const mysqlConfig = databaseConfig.mysql;
		return {
			entities: [entitiesLocation],
			synchronize,
			migrationsRun,
			migrations,
			type: 'mysql',
			host: mysqlConfig.url, //configService.getOrThrow<string>('OPERATOR_POSTGRES_URL'),
			port: mysqlConfig.port, //configService.getOrThrow<number>('OPERATOR_POSTGRES_PORT'),
			username: mysqlConfig.user, //configService.getOrThrow<string>('OPERATOR_POSTGRES_USER'),
			password: mysqlConfig.password, //configService.getOrThrow<string>('OPERATOR_POSTGRES_PASSWORD'),
			database: mysqlConfig.database, //configService.getOrThrow<string>('OPERATOR_POSTGRES_DB'),
		}
	}
	if (databaseConfig.sqlite) {
		logger.log('Sqlite driver chosen.')
		const sqliteConfig = databaseConfig.sqlite;
		return {
			entities: [entitiesLocation],
			synchronize,
			migrationsRun,
			migrations,
			type: 'sqlite',
			database: join(
				config.getHomePath(),
				sqliteConfig.database,
			)
		}
	}

	throw new Error('No database config found!');
}
