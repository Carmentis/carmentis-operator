import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { OrganisationEntity } from './entities/organisation.entity';
import { OrganisationAccessRightEntity } from './entities/organisation-access-right.entity';
import { ApplicationEntity } from './entities/application.entity';
import { OrganisationService } from './services/organisation.service';
import { UserService } from './services/user.service';
import { ApplicationService } from './services/application.service';
import { AccessRightService } from './services/access-right.service';
import ChainService from './services/chain.service';
import { ChallengeService } from './services/challenge.service';
import { ChallengeEntity } from './entities/challenge.entity';
import { EnvService } from './services/env.service';
import { ApiKeyEntity } from './entities/api-key.entity';
import { ApiKeyService } from './services/api-key.service';
import { ApiKeyUsageEntity } from './entities/api-key-usage.entity';
import { CryptoService } from './services/crypto.service';
import { EncryptionService } from './services/encryption.service';
import { EncryptionServiceProxy } from './encryption.singleton';


const WORKSPACE_PROVIDERS = [
	EncryptionService,
	CryptoService,
	ApiKeyService,
	OrganisationService,
	UserService,
	ApplicationService,
	AccessRightService,
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
			ChallengeEntity,
			ApiKeyEntity,
			ApiKeyUsageEntity
		]),

	],
	providers: WORKSPACE_PROVIDERS,
	exports: WORKSPACE_PROVIDERS
})
export class SharedModule implements OnModuleInit {

	constructor(private readonly encryptionService: EncryptionService) {}

	onModuleInit() {
		EncryptionServiceProxy.setInstance(this.encryptionService);
	}
}