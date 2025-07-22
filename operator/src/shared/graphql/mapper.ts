import { createMap, createMapper } from '@automapper/core';
import { ApiKeyEntity } from '../entities/ApiKeyEntity';
import { ApiKeyType, ApiKeyUsageType, RevealedApiKeyType } from './types/ApiKeyType';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { ApplicationType } from './types/ApplicationType';
import { ApiKeyUsageEntity } from '../entities/ApiKeyUsageEntity';
import { classes } from '@automapper/classes';

export const mapper = createMapper({
	strategyInitializer: classes(),
})

createMap(mapper, ApiKeyEntity, ApiKeyType)
createMap(mapper, ApplicationEntity, ApplicationType)
createMap(mapper, ApiKeyUsageEntity, ApiKeyUsageType)
createMap(mapper, ApiKeyEntity, RevealedApiKeyType)