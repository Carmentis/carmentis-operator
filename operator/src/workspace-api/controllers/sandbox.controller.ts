import { Controller, Post, Req } from '@nestjs/common';
import { OrganisationService } from '../services/organisation.service';
import { getPublicKeyFromRequest } from '../../utils/request-public-key-access.hook';

@Controller('/workspace/api')
export class SandboxController {
	constructor(
		private readonly organisationService: OrganisationService
	) {}


	@Post('/sandbox')
	async createSandbox(@Req() request: Request) {
		const publicKey = getPublicKeyFromRequest(request);
		const sandbox = await this.organisationService.createSandbox(publicKey);
		return sandbox;
	}
}