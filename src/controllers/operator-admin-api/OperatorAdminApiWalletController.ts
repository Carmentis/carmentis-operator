import { Controller } from '@nestjs/common';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Crud } from '@nestjsx/crud';
import { WalletEntity } from '../../entities/WalletEntity';

@Crud({
	model: {
		type: WalletEntity,
	},
})
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/wallet`)
export class OperatorAdminApiWalletController {

}
