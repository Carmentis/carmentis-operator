import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../shared/entities/user.entity';
import { OrganisationEntity } from '../shared/entities/organisation.entity';
import { OrganisationAccessRightEntity } from '../shared/entities/organisation-access-right.entity';
import { ApplicationEntity } from '../shared/entities/application.entity';

import PackageConfigService from '../package.service';
import { ChallengeEntity } from '../shared/entities/challenge.entity';
import { JwtModule } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { GraphQLJwtAuthGuard } from './guards/authentication.guards';
import { APP_GUARD } from '@nestjs/core';

import { SharedModule } from '../shared/shared.module';
import { ApiKeyGuard } from '../shared/guards/api-key-guard';
import {
	ApplicationResolver,
	OrganisationResolver,
	OrganisationStatisticsResolver,
} from '../shared/graphql/resolvers/organisation.resolver';
import { LoginResolver } from '../shared/graphql/resolvers/login.resolver';
import { UserResolver } from '../shared/graphql/resolvers/user.resolver';
import { ApiKeysResolver } from '../shared/graphql/resolvers/api-keys.resolver';
import { GeneralResolver } from '../shared/graphql/resolvers/general.resolver';

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