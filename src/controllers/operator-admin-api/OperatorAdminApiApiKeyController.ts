import { Body, Controller, Logger, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Crud, CrudController, CrudOptions } from '@dataui/crud';
import { ApiKeyEntity } from '../../entities/ApiKeyEntity';
import { ApiKeyService } from '../../services/ApiKeyService';
import { ApplicationService } from '../../services/ApplicationService';
import { ApiKeyCreationDto } from '../../dto/ApiKeyCreationDto';
import { ApplicationEntity } from '../../entities/ApplicationEntity';

@Crud({
	model: {
		type: ApiKeyEntity,
	},
	routes: {
		only: ['getOneBase', 'getManyBase', 'deleteOneBase'],
	},
	query: {
		join: {
			application: {
				eager: true,
				allow: ["vbId", "name"]
			},
		},
	}
} as CrudOptions)
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/apiKey`)
export class OperatorAdminApiApiKeyController  {
	private logger = new Logger(OperatorAdminApiApiKeyController.name);

	constructor(
		public service: ApiKeyService,
	) {}

	@Post()
	async createApiKey(
		@Body() body: ApiKeyCreationDto
	) {
		this.logger.log('Creating API key for application with VB ID:', body.applicationVbId);
		const application = await ApplicationEntity.findOneByOrFail({
			vbId: body.applicationVbId
		});
		const activeUntil = body.activeUntil ? new Date(body.activeUntil) : undefined;
		const apiKey = await this.service.createKey(
			body.name,
			application,
			activeUntil
		);
		return apiKey;
	}

	@Patch('/:id/toggle')
	async toggle(@Param('id', ParseIntPipe) id: number) {
		await this.service.toggleActivityForApiKeyById(id);
	}

}
