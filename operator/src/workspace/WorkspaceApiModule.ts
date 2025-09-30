import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { SharedModule } from '../shared/SharedModule';
import { UnrestrictedOrganisationResolver } from './graphql/resolvers/jwt-protected/organization/UnrestrictedOrganisationResolver';
import { LoginResolver } from './graphql/resolvers/public/LoginResolver';
import { UserResolver } from './graphql/resolvers/jwt-protected/UserResolver';
import { ApiKeysResolver } from './graphql/resolvers/jwt-protected/ApiKeysResolver';
import { GraphQLJwtAuthGuard } from './guards/GraphQLJwtAuthGuard';
import { ApplicationResolver } from './graphql/resolvers/jwt-protected/application/ApplicationResolver';
import { NodeAdditionalFieldsResolver } from './graphql/resolvers/jwt-protected/NodeAdditionalFieldsResolver';
import { OperatorConfigModule } from '../config/OperatorConfigModule';
import { OperatorConfigService } from '../config/services/operator-config.service';
import { EnvService } from '../shared/services/EnvService';
import { OperatorInitializationResolver } from './graphql/resolvers/public/OperatorInitialization';
import { OperatorConfigResolver } from './graphql/resolvers/jwt-protected/OperatorConfigResolver';
import {
	MemberRestrictedOrganizationResolver
} from './graphql/resolvers/jwt-protected/organization/MemberRestrictedOrganizationResolver';
import {
	OrganizationAdditionalFieldsResolver
} from './graphql/resolvers/jwt-protected/organization/OrganizationAdditionalFieldsResolver';
import {
	OrganizationMemberRestrictedApplicationResolver
} from './graphql/resolvers/jwt-protected/application/OrganizationMemberRestrictedApplicationResolver';


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
	UnrestrictedOrganisationResolver,
	LoginResolver,
	UserResolver,
	ApiKeysResolver,
	OperatorInitializationResolver,
	OperatorConfigResolver,
	ApplicationResolver,
	NodeAdditionalFieldsResolver,
	MemberRestrictedOrganizationResolver,
	OrganizationAdditionalFieldsResolver,
	OrganizationMemberRestrictedApplicationResolver
];

@Module({
	imports: WORKSPACE_IMPORTS,
	providers: WORKSPACE_PROVIDERS,
})
export class WorkspaceApiModule {
}