import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';

import { SharedModule } from '../shared/SharedModule';
import { UnrestrictedOrganisationResolver } from './graphql/resolvers/jwt-protected/organization/UnrestrictedOrganisationResolver';
import { LoginResolver } from './graphql/resolvers/public/LoginResolver';
import { UserResolver } from './graphql/resolvers/jwt-protected/UserResolver';
import { GraphQLJwtAuthGuard } from './guards/GraphQLJwtAuthGuard';
import { ApplicationResolver } from './graphql/resolvers/jwt-protected/application/ApplicationResolver';
import { NodeAdditionalFieldsResolver } from './graphql/resolvers/jwt-protected/node/NodeAdditionalFieldsResolver';
import { OperatorConfigModule } from '../config/OperatorConfigModule';
import { OperatorConfigService } from '../config/services/operator-config.service';
import { EnvService } from '../shared/services/EnvService';
import { OperatorInitializationResolver } from './graphql/resolvers/public/OperatorInitialization';
import { OperatorConfigResolver } from './graphql/resolvers/jwt-protected/OperatorConfigResolver';
import {
	OrganizationMemberRestrictedOrganizationResolver
} from './graphql/resolvers/jwt-protected/organization/OrganizationMemberRestrictedOrganizationResolver';
import {
	OrganizationAdditionalFieldsResolver
} from './graphql/resolvers/jwt-protected/organization/OrganizationAdditionalFieldsResolver';
import {
	OrganizationMemberRestrictedApplicationResolver
} from './graphql/resolvers/jwt-protected/application/OrganizationMemberRestrictedApplicationResolver';
import {
	ApiKeyAdditionalFieldsResolver
} from './graphql/resolvers/jwt-protected/api-key/ApiKeyAdditionalFieldsResolver';
import {
	OrganizationMemberRestrictedApiKeyResolver
} from './graphql/resolvers/jwt-protected/api-key/OrganizationMemberRestrictedApiKeyResolver';


const WORKSPACE_IMPORTS = [
	OperatorConfigModule,
	SharedModule,
	JwtModule.registerAsync({
		imports: [OperatorConfigModule,SharedModule],
		inject: [OperatorConfigService, EnvService],
		useFactory: async (configService: OperatorConfigService, envService: EnvService) => {
			const secret = await envService.getOrCreateJwtSecret();
			await envService.storeJwtSecret(secret);
			const options: JwtModuleOptions = {
				global: true,
				secret,
				signOptions: { expiresIn: configService.getJwtTokenValidity() },
			}
			return options;
		},
	}),
];


const WORKSPACE_PROVIDERS = [
	GraphQLJwtAuthGuard,





	ApplicationResolver,

	// public resolvers
	LoginResolver,
	OperatorInitializationResolver,

	// config resolvers
	OperatorConfigResolver,

	// addition fields resolvers
	NodeAdditionalFieldsResolver,
	ApiKeyAdditionalFieldsResolver,

	// authentication-protected resolvers
	UnrestrictedOrganisationResolver,
	UserResolver,

	// organization member restricted resolvers
	OrganizationMemberRestrictedOrganizationResolver,
	OrganizationAdditionalFieldsResolver,
	OrganizationMemberRestrictedApplicationResolver,
	OrganizationMemberRestrictedApiKeyResolver,
];

@Module({
	imports: WORKSPACE_IMPORTS,
	providers: WORKSPACE_PROVIDERS,
})
export class WorkspaceApiModule {
}