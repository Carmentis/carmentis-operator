import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceApiController } from './workspace-api.controller';
import { OrganisationController } from './controllers/organisation/organisation.controller';
import { SearchController } from './controllers/search.controller';
import { UserController } from './controllers/user.controller';

import { UserEntity } from '../shared/entities/user.entity';
import { OrganisationEntity } from '../shared/entities/organisation.entity';
import { OrganisationAccessRightEntity } from '../shared/entities/organisation-access-right.entity';
import { ApplicationEntity } from '../shared/entities/application.entity';
import { OracleEntity } from '../shared/entities/oracle.entity';
import { AuditLogEntity } from '../shared/entities/audit-log.entity';

import PackageConfigService from '../package.service';
import { AdminController } from './controllers/admin.controller';
import { SandboxController } from './controllers/sandbox.controller';
import { LoginController } from './controllers/login.controller';
import { ChallengeEntity } from '../shared/entities/challenge.entity';
import { JwtModule } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { AuthGuard } from './guards/authentication.guards';
import { APP_GUARD } from '@nestjs/core';

import { SetupController } from './controllers/setup.controller';
import { OrganisationScopedController } from './controllers/organisation/organisation-scoped.controller';
import { UserInOrganisationGuard } from './guards/user-in-organisation.guard';
import {
	CanEditApplications,
	CanEditOracles,
	CanEditUsers,
	IsAdminInOrganisation,
} from './guards/user-has-valid-access-right.guard';
import {
	OrganisationOracleEditionScopedController,
} from './controllers/organisation/organisation-oracle-edition-scoped.controller';
import {
	OrganisationApplicationEditionScopedController,
} from './controllers/organisation/organisation-application-edition-scoped.controller';
import {
	OrganisationUserEditionScopedController,
} from './controllers/organisation/organisation-user-edition-scoped.controller';
import { SharedModule } from '../shared/shared.module';
import { ChainController } from './controllers/chain.controller';

// Extracted imports, controllers, and providers into constants
export const DEFAULT_JWT_TOKEN_VALIDITY = "8h"
const WORKSPACE_IMPORTS = [
	SharedModule,
	TypeOrmModule.forFeature([
		UserEntity,
		OrganisationEntity,
		OrganisationAccessRightEntity,
		ApplicationEntity,
		OracleEntity,
		AuditLogEntity,
		ChallengeEntity
	]),
	JwtModule.register({
		global: true,
		secret: process.env.JWT_SECRET || crypto.randomBytes(32),
		signOptions: { expiresIn: process.env.JWT_TOKEN_VALIDITY || DEFAULT_JWT_TOKEN_VALIDITY },
	}),
];

const WORKSPACE_CONTROLLERS = [
	ChainController,
	WorkspaceApiController,
	AdminController,
	OrganisationController,
	OrganisationScopedController,
	OrganisationOracleEditionScopedController,
	OrganisationApplicationEditionScopedController,
	OrganisationUserEditionScopedController,
	SearchController,
	UserController,
	SandboxController,
	SetupController,
	LoginController,
];

const WORKSPACE_PROVIDERS = [
	PackageConfigService,
	AuthGuard,
	UserInOrganisationGuard,
	CanEditApplications,
	CanEditOracles,
	CanEditUsers,
	IsAdminInOrganisation,
	{
		provide: APP_GUARD,
		useClass: AuthGuard,
	},
];

@Module({
	imports: WORKSPACE_IMPORTS,
	controllers: WORKSPACE_CONTROLLERS,
	providers: WORKSPACE_PROVIDERS,
})
export class WorkspaceApiModule {
}