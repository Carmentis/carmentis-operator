import { Module } from '@nestjs/common';
import { WorkspaceApiModule } from './workspace/WorkspaceApiModule';
import PackageConfigService from './services/PackageConfigService';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getPostgresConfig } from './database/getPostgresConfig';
import { DatabaseInitService } from './database/DatabaseInitService';
import { OperatorApiModule } from './operator/OperatorApiModule';
import { SharedModule } from './shared/SharedModule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { getDatabaseConfig } from './database/getDatabaseConfig';
import { OperatorConfigService } from './config/services/operator-config.service';
import { OperatorConfigModule } from './config/OperatorConfigModule';

@Module({
	imports: [
		OperatorConfigModule,
		SharedModule,
		OperatorApiModule,
		WorkspaceApiModule,
		ConfigModule.forRoot({
			envFilePath: ['.env.local', '.env', '../.env',  ],
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			imports: [OperatorConfigModule],
			inject: [OperatorConfigService],
			useFactory: (configService: OperatorConfigService) => getDatabaseConfig(configService),
		}),
		GraphQLModule.forRootAsync<ApolloDriverConfig>({
			driver: ApolloDriver,
			imports: [OperatorConfigModule],
			inject: [OperatorConfigService],
			useFactory: (config: OperatorConfigService) => ({
				debug: config.launchGraphQLInDebugMode(),
				autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
			})
		}),
	],
	providers: [PackageConfigService],
	exports: [PackageConfigService],
})
export class AppModule {
}
