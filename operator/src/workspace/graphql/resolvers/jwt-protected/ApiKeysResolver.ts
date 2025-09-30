import { BadRequestException, NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ApiKeyEntity } from '../../../../shared/entities/ApiKeyEntity';
import { CurrentUser } from '../../../decorators/CurrentUserDecorator';
import { UserEntity } from '../../../../shared/entities/UserEntity';
import { ApiKeyService } from '../../../../shared/services/ApiKeyService';
import { ApiKeyType } from '../../types/ApiKeyType';
import { ApiKeyUsageEntity } from '../../../../shared/entities/ApiKeyUsageEntity';
import { ApplicationType } from '../../types/ApplicationType';
import { mapper } from '../../mapper';
import { ApplicationEntity } from '../../../../shared/entities/ApplicationEntity';
import { GraphQLJwtAuthGuard } from '../../../guards/GraphQLJwtAuthGuard';
import { ApplicationByIdPipe } from '../../../pipes/ApplicationByIdPipe';
import { ApiKeyUsageType } from '../../types/ApiKeyUsageType';
import { RevealedApiKeyType } from '../../types/RevealedApiKeyType';
import { JwtProtectedResolver } from './JwtProtectedResolver';

@Resolver(of => ApiKeyType)
export class ApiKeysResolver extends JwtProtectedResolver {

	constructor(
		private readonly apiKeyService: ApiKeyService,
	) { super() }



	/**
	 * This function creates an api key and reveal it.
	 *
	 * Security note: The key is never revealed in another place.
	 */
	@Mutation(returns => RevealedApiKeyType, { name: 'createApiKey' })
	async createApiKey(
		@Args('applicationId', { type: () => Int }, ApplicationByIdPipe) application: ApplicationEntity,
		@Args('name') name: string,
		@Args('activeUntil') activeUntil: string,
	) {
		// parse the data
		const receivedActiveUntil = activeUntil;
		try {
			const activeUntil = new Date(Date.parse(receivedActiveUntil));
			const result = await this.apiKeyService.createKey(application, { name, activeUntil });
			const mappedKey: RevealedApiKeyType = mapper.map(result.keyEntity, ApiKeyEntity, RevealedApiKeyType);
			mappedKey.key = result.formattedKey;
			return mappedKey;
		} catch (e) {
			throw new BadRequestException(`Invalid date: ${e}`)
		}

	}

	@Query(returns => [ApiKeyType])
	async getAllApiKeysOfApplication(
		@CurrentUser() user: UserEntity,
		@Args('applicationId', { type: () => Int }, ApplicationByIdPipe) application: ApplicationEntity,
	) {
		const keys = await this.apiKeyService.findAllKeysByApplication(application);
		return mapper.mapArray(keys, ApiKeyEntity, ApiKeyType)
	}



	@Query(returns => ApiKeyType, { name: 'getApiKey' })
	async getApiKey(
		@CurrentUser() user: UserEntity,
		@Args('id', { type: () => Int }) id: number
	): Promise<ApiKeyType> {
		const key = await this.apiKeyService.findOneById(id);
		return mapper.map(key, ApiKeyEntity, ApiKeyType)
	}

 @Mutation(returns => Boolean)
 async updateApiKey(
 	@CurrentUser() user: UserEntity,
 	@Args('id', { type: () => Int }) id: number,
 	@Args('name', { type: () => String }) name: string,
 	@Args('isActive', { type: () => Boolean }) isActive: boolean,
 	@Args('activeUntil', { type: () => String, nullable: true }) activeUntil?: string,
 ): Promise<boolean> {
 	const key = await this.apiKeyService.findOneById(id);
 	if (!key) throw new NotFoundException(`key with id ${id} not found`);
	
 	const updateData: Partial<ApiKeyEntity> = { isActive, name };

	 console.log("update api key, activeUntil:", activeUntil);
 	if (activeUntil) {
 		try {
 			updateData.activeUntil = new Date(Date.parse(activeUntil));
 		} catch (e) {
 			throw new BadRequestException(`Invalid date: ${e}`);
 		}
 	}
	
 	await this.apiKeyService.updateKey(key.id, updateData);
 	return true;
 }

	@Mutation(returns => Boolean)
	async deleteApiKey(
		@CurrentUser() user: UserEntity,
		@Args('id', { type: () => Int }) id: number
	): Promise<boolean> {
		await this.apiKeyService.deleteKeyById(id);
		return true;
	}

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