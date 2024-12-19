import { ConfigService } from '@nestjs/config';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
	private readonly logger = new Logger(DatabaseInitService.name);
	constructor(private readonly configService: ConfigService) {}


	async onModuleInit() {
		const host = this.configService.getOrThrow<string>(
			'OPERATOR_DATABASE_URL',
		);
		const port = this.configService.getOrThrow<number>('OPERATOR_DATABASE_PORT');
		const username = this.configService.getOrThrow<string>('OPERATOR_DATABASE_USERNAME');
		const password = this.configService.getOrThrow<string>('OPERATOR_DATABASE_PASSWORD');
		const database = this.configService.getOrThrow<string>('OPERATOR_DATABASE_NAME');


		this.logger.log(`Creating database '${database}'`);
		const client = new Client({
			host: host,
			port: port,
			user: username,
			password: password,
			database: database,
		});

		try {
			await client.connect();
			// Check if the database exists
			const result = await client.query(
				`SELECT 1 FROM pg_database WHERE datname = $1`,
				[database],
			);

			if (result.rowCount === 0) {
				// Create the database if it doesn't exist
				await client.query(`CREATE DATABASE "${database}"`);
				this.logger.log(`Database "${database}" created successfully.`);
			} else {
				this.logger.log(`Database "${database}" already exists.`);
			}
		} catch (error) {
			this.logger.warn('Error initializing the database:', error);
		} finally {
			await client.end();
		}
	}
}