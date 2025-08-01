import { createMap, createMapper } from '@automapper/core';
import { ApiKeyEntity } from '../../shared/entities/ApiKeyEntity';
import { ApiKeyType } from './types/ApiKeyType';
import { ApplicationEntity } from '../../shared/entities/ApplicationEntity';
import { ApplicationType } from './types/ApplicationType';
import { ApiKeyUsageEntity } from '../../shared/entities/ApiKeyUsageEntity';
import { classes } from '@automapper/classes';
import { ApiKeyUsageType } from './types/ApiKeyUsageType';
import { RevealedApiKeyType } from './types/RevealedApiKeyType';

export const mapper = createMapper({
	strategyInitializer: classes(),
})

createMap(mapper, ApiKeyEntity, ApiKeyType)
createMap(mapper, ApplicationEntity, ApplicationType)
createMap(mapper, ApiKeyUsageEntity, ApiKeyUsageType)
createMap(mapper, ApiKeyEntity, RevealedApiKeyType)