import { Body, Controller, Post } from '@nestjs/common';
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
} as CrudOptions)
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/apiKey`)
export class OperatorAdminApiApiKeyController  {
	constructor(
		public service: ApiKeyService,
	) {}

	@Post()
	async createApiKey(
		@Body() body: ApiKeyCreationDto
	) {
		const application = await ApplicationEntity.findOneByOrFail({
			vbId: body.applicationVbId
		});
		const activeUntil = new Date(body.activeUntil);
		const apiKey = await this.service.createKey(
			body.name,
			application,
			activeUntil
		);
		return apiKey;
	}
}
