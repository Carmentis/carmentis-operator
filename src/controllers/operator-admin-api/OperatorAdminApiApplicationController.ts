import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Crud } from '@dataui/crud';
import { ApplicationEntity } from '../../entities/ApplicationEntity';
import { ApplicationService } from '../../services/ApplicationService';
import { ApplicationCreationDto } from '../../dto/ApplicationCreationDto';
import { ApplicationUpdateDto } from '../../dto/ApplicationUpdateDto';
import { WalletEntity } from '../../entities/WalletEntity';

@Crud({
	model: {
		type: ApplicationEntity,
	},
	params: {
		vbId: {
			field: 'vbId',
			type: 'string',
			primary: true,
		},
	},
	query: {
		join: {
			wallet: {
				eager: true,
				allow: ["walletId", "name", "rpcEndpoint", "indexerEndpoint"]
			},
		},
	},

	routes: {
		// create/update/delete are handled manually below: creation needs to resolve the
		// wallet relation, update is restricted to `name` only, and delete must refuse when
		// API keys or anchor requests still depend on the application.
		only: ['getOneBase', 'getManyBase'],
	}

})
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/application`)
export class OperatorAdminApiApplicationController {
	constructor(public service: ApplicationService) {}


	@Post()
	async createApplication(
		@Body() body: ApplicationCreationDto
	) {
		const wallet  = await WalletEntity.findOneBy({ id: body.walletId });
		return await ApplicationEntity.save({
			vbId: body.vbId,
			name: body.name,
			wallet: wallet
		})
	}

	@Patch(':vbId')
	async updateApplication(@Param('vbId') vbId: string, @Body() dto: ApplicationUpdateDto) {
		return this.service.updateApplication(vbId, dto);
	}

	@Delete(':vbId')
	async deleteApplication(@Param('vbId') vbId: string) {
		await this.service.deleteApplication(vbId);
	}
}
