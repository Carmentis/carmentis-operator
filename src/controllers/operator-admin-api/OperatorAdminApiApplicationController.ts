import { Controller } from '@nestjs/common';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Crud } from '@nestjsx/crud';
import { ApplicationEntity } from '../../entities/ApplicationEntity';

@Crud({
	model: {
		type: ApplicationEntity,
	},
})
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/application`)
export class OperatorAdminApiApplicationController {

}
