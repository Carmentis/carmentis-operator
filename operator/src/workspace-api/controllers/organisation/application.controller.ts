import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Logger,
	Param,
	Post,
	UseInterceptors,
} from '@nestjs/common';
import { ApplicationService } from '../../../shared/services/application.service';
import { ApiKeyCreationDto } from '../../dto/api-key-creation.dto';
import { ApiKeyService } from '../../../shared/services/api-key.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('/workspace/api/application')
export class ApplicationController {

	private readonly logger = new Logger(ApplicationController.name);

	constructor(
		private readonly applicationService: ApplicationService,
		private readonly apiKeyService: ApiKeyService,
	) {}



	@Get(':applicationId/apiKeys')
	async getAllKeys(@Param("applicationId") applicationId: number) {
		const application = await this.applicationService.findApplication(applicationId);
		return this.apiKeyService.findAllKeysByApplication(application)
	}


	@Post(':applicationId/apiKeys')
	async createKey(
		@Body() body: ApiKeyCreationDto,
		@Param("applicationId") applicationId: number,
	) {
		const application = await this.applicationService.findApplication(applicationId);
		const activeUntil = new Date(body.activeUntil);
		const key = await this.apiKeyService.createKey(application, {
			name: body.name,
			activeUntil,
		})
		this.logger.log(`API Key '${body.name}' created`)
		return key;
	}
}