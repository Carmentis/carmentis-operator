import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/UserEntity';
import { OrganisationEntity } from './entities/OrganisationEntity';
import { OrganisationAccessRightEntity } from './entities/OrganisationAccessRightEntity';
import { ApplicationEntity } from './entities/ApplicationEntity';
import { OrganisationService } from './services/OrganisationService';
import { UserService } from './services/UserService';
import { ApplicationService } from './services/ApplicationService';
import { AccessRightService } from './services/AccessRightService';
import ChainService from './services/ChainService';
import { ChallengeService } from './services/ChallengeService';
import { ChallengeEntity } from './entities/ChallengeEntity';
import { EnvService } from './services/EnvService';
import { ApiKeyEntity } from './entities/ApiKeyEntity';
import { ApiKeyService } from './services/ApiKeyService';
import { ApiKeyUsageEntity } from './entities/ApiKeyUsageEntity';
import { CryptoService } from './services/CryptoService';
import { EncryptionService } from './services/EncryptionService';
import { EncryptionServiceProxy } from './transformers/EncryptionServiceProxy';
import { NodeEntity } from './entities/NodeEntity';
import { NodeService } from './services/NodeService';

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
	NodeService
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
			ApiKeyUsageEntity,
			NodeEntity,
		]),
	],
	providers: [
		...WORKSPACE_PROVIDERS,
	],
	exports: WORKSPACE_PROVIDERS
})
export class SharedModule implements OnModuleInit {

	constructor(private readonly encryptionService: EncryptionService) {}

	onModuleInit() {
		EncryptionServiceProxy.setInstance(this.encryptionService);
	}
}