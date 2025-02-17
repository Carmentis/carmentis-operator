import { Controller, Post, Req } from '@nestjs/common';
import { OrganisationService } from '../../shared/services/organisation.service';
import { getPublicKeyFromRequest } from '../../utils/request-public-key-access.hook';
import { UserService } from '../../shared/services/user.service';
import { SandboxService } from '../../shared/services/sandbox.service';

@Controller('/workspace/api')
export class SandboxController {
	constructor(
		private readonly sandboxController: SandboxService,
		private readonly userService: UserService,
	) {}


	@Post('/sandbox')
	async createSandbox(@Req() request: Request) {
		const user = await this.userService.findCurrentlyConnectedUser(request);
		return await this.sandboxController.createSandbox(user);
	}
}