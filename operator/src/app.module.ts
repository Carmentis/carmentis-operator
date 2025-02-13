import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WorkspaceApiModule } from './workspace-api/workspace-api.module';
import PackageConfigService from './package.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getPostgresConfig } from './database/database.config';
import { DatabaseInitService } from './database/database-init.service';
import { OperatorApiModule } from './operator-api/operator-api.module';
import { EnvService } from './services/env.service';
import { SharedModule } from './shared/shared.module';

@Module({
	imports: [
		SharedModule,
		OperatorApiModule,
		WorkspaceApiModule,
		ConfigModule.forRoot({
			envFilePath: ['.env.local', '.env', '../.env',  ],
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => getPostgresConfig(configService),
		}),
	],
	controllers: [AppController],
	providers: [PackageConfigService,DatabaseInitService, EnvService],
	exports: [PackageConfigService,EnvService],
})
export class AppModule {
}
