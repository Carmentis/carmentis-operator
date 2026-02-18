import { Controller } from '@nestjs/common';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Crud, CrudController } from '@dataui/crud';
import { WalletEntity } from '../../entities/WalletEntity';
import { WalletService } from '../../services/WalletService';

@Crud({
	model: {
		type: WalletEntity,
	},
	params: {
		publicKey: {
			field: 'walletId',
			type: 'number',
			primary: true,
		},
	},
})
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/wallet`)
export class OperatorAdminApiWalletController {
	constructor(public service: WalletService) {}
}
