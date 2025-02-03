import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceApiController } from './workspace-api.controller';
import { OrganisationController } from './controllers/organisation.controller';
import { SearchController } from './controllers/search.controller';
import { UserController } from './controllers/user.controller';

import { UserEntity } from './entities/user.entity';
import { OrganisationEntity } from './entities/organisation.entity';
import { OrganisationAccessRightEntity } from './entities/organisation-access-right.entity';
import { ApplicationEntity } from './entities/application.entity';
import { OracleEntity } from './entities/oracle.entity';
import { AuditLogEntity } from './entities/audit-log.entity';

import PackageConfigService from '../package.service';
import { AdministrationService } from './services/administration.service';
import { OrganisationService } from './services/organisation.service';
import { UserService } from './services/user.service';
import { ApplicationService } from './services/application.service';
import { AccessRightService } from './services/access-right.service';
import { AuditService } from './services/audit.service';
import { OracleService } from './services/oracle.service';
import ChainService from './services/chain.service';
import { AdminController } from './controllers/admin.controller';
import { SandboxController } from './controllers/sandbox.controller';
import { LoginController } from './controllers/login.controller';
import { ChallengeService } from './services/challenge.service';
import { ChallengeEntity } from './entities/challenge.entity';
import { JwtModule } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { AuthGuard } from './guards/authentication.guards';
import { APP_GUARD } from '@nestjs/core';

import { SetupController } from './controllers/setup.controller';

// Extracted imports, controllers, and providers into constants
const WORKSPACE_IMPORTS = [
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
		signOptions: { expiresIn: '60s' },
	}),
];

const WORKSPACE_CONTROLLERS = [
	WorkspaceApiController,
	AdminController,
	OrganisationController,
	SearchController,
	UserController,
	SandboxController,
	SetupController,
	LoginController,
];

const WORKSPACE_PROVIDERS = [
	PackageConfigService,
	AdministrationService,
	OrganisationService,
	UserService,
	ApplicationService,
	AccessRightService,
	AuditService,
	OracleService,
	ChainService,
	ChallengeService,
	AuthGuard,
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