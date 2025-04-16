import { createMap, createMapper } from '@automapper/core';
import { ApiKeyEntity } from '../entities/api-key.entity';
import { ApiKeyType, ApiKeyUsageType, RevealedApiKeyType } from './object-types/api-key.type';
import { ApplicationEntity } from '../entities/application.entity';
import { ApplicationType } from './object-types/application.type';
import { ApiKeyUsageEntity } from '../entities/api-key-usage.entity';
import { classes } from '@automapper/classes';

export const mapper = createMapper({
	strategyInitializer: classes(),
})

createMap(mapper, ApiKeyEntity, ApiKeyType)
createMap(mapper, ApplicationEntity, ApplicationType)
createMap(mapper, ApiKeyUsageEntity, ApiKeyUsageType)
createMap(mapper, ApiKeyEntity, RevealedApiKeyType)