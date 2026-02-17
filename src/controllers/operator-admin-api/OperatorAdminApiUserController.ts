import { Controller } from '@nestjs/common';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Crud } from '@nestjsx/crud';
import { UserEntity } from '../../entities/UserEntity';

@Crud({
	model: {
		type: UserEntity,
	},
})
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/user`)
export class OperatorAdminApiUserController {

}