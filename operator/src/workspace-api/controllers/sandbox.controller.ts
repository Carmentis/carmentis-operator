import { Controller, Post } from '@nestjs/common';
import { OrganisationService } from '../services/organisation.service';

@Controller('/workspace/api')
export class SandboxController {
	constructor(
		private readonly organisationService: OrganisationService
	) {}


	@Post('/sandbox')
	async createSandbox() {
		const sandbox = await this.organisationService.createSandbox();
		return sandbox;
	}
}