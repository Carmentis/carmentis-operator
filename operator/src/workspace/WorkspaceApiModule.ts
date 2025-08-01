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

// Extracted imports, controllers, and providers into constants
export const DEFAULT_JWT_TOKEN_VALIDITY = "8h"

const WORKSPACE_IMPORTS = [
	SharedModule,
	JwtModule.register({
		global: true,
		secret: process.env.JWT_SECRET || crypto.randomBytes(32),
		signOptions: { expiresIn: process.env.JWT_TOKEN_VALIDITY || DEFAULT_JWT_TOKEN_VALIDITY },
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
];

@Module({
	imports: WORKSPACE_IMPORTS,
	providers: WORKSPACE_PROVIDERS,
})
export class WorkspaceApiModule {
}