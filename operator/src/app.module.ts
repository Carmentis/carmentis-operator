import { Module } from '@nestjs/common';
import { WorkspaceApiModule } from './workspace/workspace-api.module';
import PackageConfigService from './package.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getPostgresConfig } from './database/database.config';
import { DatabaseInitService } from './database/database-init.service';
import { OperatorApiModule } from './operator/operator-api.module';
import { SharedModule } from './shared/shared.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

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
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
		}),
	],
	providers: [PackageConfigService,DatabaseInitService],
	exports: [PackageConfigService],
})
export class AppModule {
}
