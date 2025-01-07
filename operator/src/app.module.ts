import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WorkspaceApiModule } from './workspace-api/workspace-api.module';
import PackageConfigService from './package.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getPostgresConfig } from './database/database.config';
import { DatabaseInitService } from './database/database-init.service';
import { OperatorApiModule } from './operator-api/operator-api.module';

@Module({
	imports: [
		OperatorApiModule,
		WorkspaceApiModule,
		ConfigModule.forRoot({
			envFilePath: ['../.env', '.env'],
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => getPostgresConfig(configService),
		}),
	],
	controllers: [AppController],
	providers: [PackageConfigService,DatabaseInitService, ],
	exports: [PackageConfigService],
})
export class AppModule {
}
