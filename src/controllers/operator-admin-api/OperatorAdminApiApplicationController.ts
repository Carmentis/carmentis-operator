import { Body, Controller, Post } from '@nestjs/common';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Crud, CrudController } from '@dataui/crud';
import { ApplicationEntity } from '../../entities/ApplicationEntity';
import { ApplicationService } from '../../services/ApplicationService';
import { ApplicationCreationDto } from '../../dto/ApplicationCreationDto';
import { WalletEntity } from '../../entities/WalletEntity';

@Crud({
	model: {
		type: ApplicationEntity,
	},
	params: {
		publicKey: {
			field: 'vbId',
			type: 'string',
			primary: true,
		},
	},
	query: {
		join: {
			wallet: {
				eager: true,
				allow: ["walletId", "name", "rpcEndpoint"]
			},
		},
	},

	routes: {
		only: ['getOneBase', 'getManyBase', 'deleteOneBase'],
	}

})
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/application`)
export class OperatorAdminApiApplicationController {
	constructor(public service: ApplicationService) {}


	@Post()
	async createApplication(
		@Body() body: ApplicationCreationDto
	) {
		const wallet  = await WalletEntity.findOneBy({ walletId: body.walletId });
		return await ApplicationEntity.save({
			vbId: body.vbId,
			name: body.name,
			wallet: wallet
		})
	}
}
