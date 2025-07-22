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
