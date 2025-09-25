// database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperatorConfigModule } from '../config/OperatorConfigModule';
import { OperatorConfigService } from '../config/services/operator-config.service';
import { getDatabaseConfig } from './getDatabaseConfig';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [OperatorConfigModule],
			inject: [OperatorConfigService],
			useFactory: (configService: OperatorConfigService) =>
				getDatabaseConfig(configService),
		}),
	],
})
export class DatabaseModule {

}