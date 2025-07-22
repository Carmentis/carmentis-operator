import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../shared/entities/UserEntity';
import { OrganisationEntity } from '../shared/entities/OrganisationEntity';
import { OrganisationAccessRightEntity } from '../shared/entities/OrganisationAccessRightEntity';
import { ApplicationEntity } from '../shared/entities/ApplicationEntity';

import PackageConfigService from '../package.service';
import { ChallengeEntity } from '../shared/entities/ChallengeEntity';
import { JwtModule } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { APP_GUARD } from '@nestjs/core';

import { SharedModule } from '../shared/SharedModule';
import { ApiKeyGuard } from '../shared/guards/ApiKeyGuard';
import {
	ApplicationResolver,
	OrganisationResolver,
	OrganisationStatisticsResolver,
} from '../shared/graphql/resolvers/OrganisationResolver';
import { LoginResolver } from '../shared/graphql/resolvers/LoginResolver';
import { UserResolver } from '../shared/graphql/resolvers/UserResolver';
import { ApiKeysResolver } from '../shared/graphql/resolvers/ApiKeysResolver';
import { GeneralResolver } from '../shared/graphql/resolvers/GeneralResolver';
import { GraphQLJwtAuthGuard } from './guards/GraphQLJwtAuthGuard';

// Extracted imports, controllers, and providers into constants
export const DEFAULT_JWT_TOKEN_VALIDITY = "8h"

const WORKSPACE_IMPORTS = [
	SharedModule,
	TypeOrmModule.forFeature([
		UserEntity,
		OrganisationEntity,
		OrganisationAccessRightEntity,
		ApplicationEntity,
		ChallengeEntity
	]),
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

	{
		provide: APP_GUARD,
		useClass: ApiKeyGuard,
	}
];

@Module({
	imports: WORKSPACE_IMPORTS,
	providers: WORKSPACE_PROVIDERS,
})
export class WorkspaceApiModule {
}