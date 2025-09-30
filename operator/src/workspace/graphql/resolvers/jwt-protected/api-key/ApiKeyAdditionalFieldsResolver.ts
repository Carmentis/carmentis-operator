

import { JwtProtectedResolver } from '../JwtProtectedResolver';
import { Args, Int, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ApplicationEntity } from '../../../../../shared/entities/ApplicationEntity';
import { mapper } from '../../../mapper';
import { ApplicationType } from '../../../types/ApplicationType';
import { ApiKeyUsageType } from '../../../types/ApiKeyUsageType';
import { ApiKeyUsageEntity } from '../../../../../shared/entities/ApiKeyUsageEntity';
import { ApiKeyType } from '../../../types/ApiKeyType';
import { ApiKeyService } from '../../../../../shared/services/ApiKeyService';

@Resolver(of => ApiKeyType)
export class ApiKeyAdditionalFieldsResolver extends JwtProtectedResolver {

	constructor(
		private readonly apiKeyService: ApiKeyService,
	) { super() }

	@ResolveField(() => String, { name: 'partialKey' })
	async getPartialKey(@Parent() key: ApiKeyType): Promise<string> {
		const storedKey = await this.apiKeyService.findOneById(key.id);
		return '****' + storedKey.key.slice(-4)
	}


	@ResolveField(() => ApplicationType, { name: 'application' })
	async getApplication(@Parent() key: ApiKeyType) {
		const keyObject = await this.apiKeyService.findOneById(key.id);
		console.assert(keyObject.application !== undefined, 'Application should be defined');
		const application: ApplicationEntity = keyObject.application;
		return mapper.map(application, ApplicationEntity, ApplicationType)
	}


	@ResolveField(() => Int, { name: 'countUsages' })
	async getCountUsages(
		@Parent() key: ApiKeyType,
		@Args('filterByUnauthorised') filterByUnauthorised: boolean
	) {
		return await this.apiKeyService.countsKeyUsagesByKeyId(key.id, filterByUnauthorised);
	}


	@ResolveField(() => [ApiKeyUsageType], { name: 'usages' })
	async getKeyUsages(
		@Parent() key: ApiKeyType,
		@Args('limit', { type: () => Int, nullable: true }) limit = 10,
		@Args('offset', { type: () => Int, nullable: true }) offset = 0,
		@Args('filterByUnauthorized', { type: () => Boolean, nullable: true }) filterByUnauthorized = false,
	): Promise<ApiKeyUsageType[]> {
		const usages = await this.apiKeyService.findKeyUsagesByKeyId(key.id, offset, limit, filterByUnauthorized);
		return mapper.mapArray(usages, ApiKeyUsageEntity, ApiKeyUsageType)
	}
}