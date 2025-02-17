import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { OrganisationEntity } from './entities/organisation.entity';
import { OrganisationAccessRightEntity } from './entities/organisation-access-right.entity';
import { ApplicationEntity } from './entities/application.entity';
import { OracleEntity } from './entities/oracle.entity';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AdministrationService } from './services/administration.service';
import { OrganisationService } from './services/organisation.service';
import { UserService } from './services/user.service';
import { ApplicationService } from './services/application.service';
import { AccessRightService } from './services/access-right.service';
import { AuditService } from './services/audit.service';
import { OracleService } from './services/oracle.service';
import ChainService from './services/chain.service';
import { ChallengeService } from './services/challenge.service';
import { ChallengeEntity } from './entities/challenge.entity';
import { JwtModule } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { EnvService } from './services/env.service';
import { SandboxService } from './services/sandbox.service';


const WORKSPACE_PROVIDERS = [
	SandboxService,
	AdministrationService,
	OrganisationService,
	UserService,
	ApplicationService,
	AccessRightService,
	AuditService,
	OracleService,
	ChainService,
	ChallengeService,
	EnvService,
];

// Extracted imports, controllers, and providers into constants
export const DEFAULT_JWT_TOKEN_VALIDITY = "8h"

@Module({
	imports: [
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
	],
	controllers: [],
	providers: WORKSPACE_PROVIDERS,
	exports: WORKSPACE_PROVIDERS
})
export class SharedModule {
}