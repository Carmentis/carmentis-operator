import { Module } from '@nestjs/common';
import { WorkspaceApiModule } from './workspace/WorkspaceApiModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperatorApiModule } from './operator/OperatorApiModule';
import { SharedModule } from './shared/SharedModule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { getDatabaseConfig } from './database/getDatabaseConfig';
import { OperatorConfigService } from './config/services/operator-config.service';
import { OperatorConfigModule } from './config/OperatorConfigModule';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
	imports: [
		OperatorConfigModule,
		SharedModule,
		OperatorApiModule,
		WorkspaceApiModule,
		ScheduleModule.forRoot(),
		ThrottlerModule.forRoot({
			throttlers: [
				{
					ttl: 60000,
					limit: 1000,
				},
			],
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
				formatError: (error) => {
					const original = error.extensions?.originalError as any;
					return {
						message: original?.message || error.message,
						code: error.extensions?.code,
						path: error.path,
					};
				},
			})
		}),
	],
})
export class AppModule {
}
