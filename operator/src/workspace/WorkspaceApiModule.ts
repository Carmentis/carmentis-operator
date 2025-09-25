import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { SharedModule } from '../shared/SharedModule';
import { OrganisationResolver } from './graphql/resolvers/OrganisationResolver';
import { LoginResolver } from './graphql/resolvers/LoginResolver';
import { UserResolver } from './graphql/resolvers/UserResolver';
import { ApiKeysResolver } from './graphql/resolvers/ApiKeysResolver';
import { GeneralResolver } from './graphql/resolvers/GeneralResolver';
import { GraphQLJwtAuthGuard } from './guards/GraphQLJwtAuthGuard';
import { ApplicationResolver } from './graphql/resolvers/ApplicationResolver';
import { OrganisationStatisticsResolver } from './graphql/resolvers/OrganisationStatisticsResolver';
import { NodeResolver } from './graphql/resolvers/NodeResolver';
import { OperatorConfigModule } from '../config/OperatorConfigModule';
import { OperatorConfigService } from '../config/services/operator-config.service';
import { EnvService } from '../shared/services/EnvService';


const WORKSPACE_IMPORTS = [
	OperatorConfigModule,
	SharedModule,
	JwtModule.registerAsync({
		imports: [OperatorConfigModule,SharedModule],
		inject: [OperatorConfigService, EnvService],
		useFactory: async (configService: OperatorConfigService, envService: EnvService) => {
			const secret = await envService.getOrCreateJwtSecret();
			await envService.storeJwtSecret(secret);
			return {
				global: true,
				secret,
				signOptions: { expiresIn: configService.getJwtTokenValidity() },
			}
		},
	}),
];


const WORKSPACE_PROVIDERS = [
	GraphQLJwtAuthGuard,
	OrganisationResolver,
	LoginResolver,
	UserResolver,
	OrganisationStatisticsResolver,
	ApiKeysResolver,
	GeneralResolver,
	ApplicationResolver,
	NodeResolver,
];

@Module({
	imports: WORKSPACE_IMPORTS,
	providers: WORKSPACE_PROVIDERS,
})
export class WorkspaceApiModule {
}