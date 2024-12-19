import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getPostgresConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
	type: 'postgres',
	host: configService.getOrThrow<string>('OPERATOR_DATABASE_URL'),
	port: configService.getOrThrow<number>('OPERATOR_DATABASE_PORT'),
	username: configService.getOrThrow<string>('OPERATOR_DATABASE_USERNAME'),
	password: configService.getOrThrow<string>('OPERATOR_DATABASE_PASSWORD'),
	database: configService.getOrThrow<string>('OPERATOR_DATABASE_NAME'),
	entities: [__dirname + '/../**/*.entity{.ts,.js}'],
	synchronize: true, // Set to false in production
});