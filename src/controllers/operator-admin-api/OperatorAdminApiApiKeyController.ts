import { Body, Controller, Logger, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Crud, CrudController, CrudOptions } from '@dataui/crud';
import { ApiKeyEntity } from '../../entities/ApiKeyEntity';
import { ApiKeyService } from '../../services/ApiKeyService';
import { ApplicationService } from '../../services/ApplicationService';
import { ApiKeyCreationDto } from '../../dto/ApiKeyCreationDto';
import { ApplicationEntity } from '../../entities/ApplicationEntity';
import { WalletEntity } from '../../entities/WalletEntity';

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
			wallet: {
				eager: true,
				allow: ["id", "name"]
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
		let application: ApplicationEntity | undefined;
		let wallet: WalletEntity | undefined;

		if (body.applicationVbId) {
			this.logger.log('Creating API key for application with VB ID:', body.applicationVbId);
			application = await ApplicationEntity.findOneByOrFail({
				vbId: body.applicationVbId
			});
		}

		if (body.walletId) {
			this.logger.log('Creating API key for wallet with ID:', body.walletId);
			wallet = await WalletEntity.findOneByOrFail({
				id: body.walletId
			});
		}

		if (!body.applicationVbId && !body.walletId) {
			this.logger.log('Creating API key without linked application or wallet');
		}

		const activeUntil = body.activeUntil ? new Date(body.activeUntil) : undefined;
		const apiKey = await this.service.createKey(
			body.name,
			application,
			activeUntil,
			body.endpointRegex,
			body.gasMinAtomics,
			body.gasMaxAtomics,
			wallet
		);
		return apiKey;
	}

	@Patch('/:id/toggle')
	async toggle(@Param('id', ParseIntPipe) id: number) {
		await this.service.toggleActivityForApiKeyById(id);
	}

}
