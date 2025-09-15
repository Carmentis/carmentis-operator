import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../shared/entities/UserEntity';
import { OrganisationEntity } from '../shared/entities/OrganisationEntity';
import { OrganisationAccessRightEntity } from '../shared/entities/OrganisationAccessRightEntity';
import { ApplicationEntity } from '../shared/entities/ApplicationEntity';

import PackageConfigService from '../services/PackageConfigService';
import { ChallengeEntity } from '../shared/entities/ChallengeEntity';
import { JwtModule } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { APP_GUARD } from '@nestjs/core';

import { SharedModule } from '../shared/SharedModule';
import { ApiKeyGuard } from '../operator/guards/ApiKeyGuard';
import {
	OrganisationResolver,

} from './graphql/resolvers/OrganisationResolver';
import { LoginResolver } from './graphql/resolvers/LoginResolver';
import { UserResolver } from './graphql/resolvers/UserResolver';
import { ApiKeysResolver } from './graphql/resolvers/ApiKeysResolver';
import { GeneralResolver } from './graphql/resolvers/GeneralResolver';
import { GraphQLJwtAuthGuard } from './guards/GraphQLJwtAuthGuard';
import { ApplicationResolver } from './graphql/resolvers/ApplicationResolver';
import { OrganisationStatisticsResolver } from './graphql/resolvers/OrganisationStatisticsResolver';
import { NodeEntity } from '../shared/entities/NodeEntity';
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
	PackageConfigService,
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