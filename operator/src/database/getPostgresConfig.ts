import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getPostgresConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
	type: 'postgres',
	host: configService.getOrThrow<string>('OPERATOR_POSTGRES_URL'),
	port: configService.getOrThrow<number>('OPERATOR_POSTGRES_PORT'),
	username: configService.getOrThrow<string>('OPERATOR_POSTGRES_USER'),
	password: configService.getOrThrow<string>('OPERATOR_POSTGRES_PASSWORD'),
	database: configService.getOrThrow<string>('OPERATOR_POSTGRES_DB'),
	entities: [__dirname + '/../**/*Entity{.ts,.js}'],
	synchronize: true, // Set to false in production
});