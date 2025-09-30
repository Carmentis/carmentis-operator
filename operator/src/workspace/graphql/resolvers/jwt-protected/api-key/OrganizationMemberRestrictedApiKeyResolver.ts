import { JwtProtectedResolver } from '../JwtProtectedResolver';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ApiKeyEntity } from '../../../../../shared/entities/ApiKeyEntity';
import { mapper } from '../../../mapper';
import { BadRequestException, Logger, NotFoundException, UseGuards } from '@nestjs/common';
import { OrganizationMemberRestrictedApiKeyGuard } from '../../../../guards/OrganizationMemberRestrictedApiKeyGuard';
import { ResourceId } from '../../../../decorators/ResourceId';
import { ApiKeyService } from '../../../../../shared/services/ApiKeyService';
import { ApiKeyType } from '../../../types/ApiKeyType';

@Resolver()
@UseGuards(OrganizationMemberRestrictedApiKeyGuard)
@ResourceId('id')
export class OrganizationMemberRestrictedApiKeyResolver extends JwtProtectedResolver {
	private logger = new Logger(OrganizationMemberRestrictedApiKeyResolver.name)
	constructor(
		private readonly apiKeyService: ApiKeyService,
	) { super() }


	@Query(returns => ApiKeyType, { name: 'getApiKey' })
	async getApiKey(
		@Args('id', { type: () => Int }) id: number
	): Promise<ApiKeyType> {
		const key = await this.apiKeyService.findOneById(id);
		return mapper.map(key, ApiKeyEntity, ApiKeyType)
	}

	@Mutation(returns => Boolean)
	async updateApiKey(
		@Args('id', { type: () => Int }) id: number,
		@Args('name', { type: () => String }) name: string,
		@Args('isActive', { type: () => Boolean }) isActive: boolean,
		@Args('activeUntil', { type: () => String, nullable: true }) activeUntil?: string,
	): Promise<boolean> {
		const key = await this.apiKeyService.findOneById(id);
		if (!key) throw new NotFoundException(`key with id ${id} not found`);

		const updateData: Partial<ApiKeyEntity> = { isActive, name };
		if (activeUntil) {
			try {
				updateData.activeUntil = new Date(Date.parse(activeUntil));
				this.logger.log(`Update API key ${id}: valid until ${activeUntil}`)
			} catch (e) {
				throw new BadRequestException(`Invalid date: ${e}`);
			}
		}

		await this.apiKeyService.updateKey(key.id, updateData);
		return true;
	}

	@Mutation(returns => Boolean)
	async deleteApiKey(
		@Args('id', { type: () => Int }) id: number
	): Promise<boolean> {
		await this.apiKeyService.deleteKeyById(id);
		return true;
	}
}