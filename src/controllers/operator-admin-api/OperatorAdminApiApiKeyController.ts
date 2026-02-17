import { Controller } from '@nestjs/common';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Crud, CrudOptions } from '@nestjsx/crud';
import { ApiKeyEntity } from '../../entities/ApiKeyEntity';

@Crud({
	model: {
		type: ApiKeyEntity,
	},
	routes: {
		only: ['getOneBase', 'getManyBase', 'deleteOneBase'],
	},
} as CrudOptions)
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/api-key`)
export class OperatorAdminApiApiKeyController {

}
