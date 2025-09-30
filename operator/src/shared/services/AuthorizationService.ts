import { Injectable } from '@nestjs/common';
import { OrganisationService } from './OrganisationService';
import { UserEntity } from '../entities/UserEntity';
import { ApplicationService } from './ApplicationService';
import { ApiKeyService } from './ApiKeyService';
import { NodeService } from './NodeService';

/**
 * This service is responsible for handling authorization-related decision tasks.
 */
@Injectable()
export class AuthorizationService {
	constructor(
		private readonly orgService: OrganisationService,
		private readonly appService: ApplicationService,
		private readonly apiKeyService: ApiKeyService,
		private readonly nodeService: NodeService,
	) {}

	async isAuthorizedToAccessOrganization(user: UserEntity, orgId: number) {
		if (user.isAdmin) return true;
		return this.orgService.isMemberOfOrganization(orgId, user.publicKey)
	}

	async isAuthorizedToAccessApplication(user: UserEntity, appId: number) {
		if (user.isAdmin) return true;
		const orgId = await this.appService.getOrganisationIdByApplicationId(appId);
		return this.orgService.isMemberOfOrganization(orgId, user.publicKey)
	}

	async isAuthorizedToAccessApiKey(user: UserEntity, keyId: number) {
		if (user.isAdmin) return true;
		const ordId = await this.apiKeyService.getOrganisationIdByApiKeyId(keyId);
		return this.orgService.isMemberOfOrganization(ordId, user.publicKey);
	}

	async isAuthorizedToAccessNode(user: UserEntity, nodeId: number) {
		if (user.isAdmin) return true;
		const ordId = await this.nodeService.getOrganisationIdByNodeId(nodeId);
		return this.orgService.isMemberOfOrganization(ordId, user.publicKey);
	}
}