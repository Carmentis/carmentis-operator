import { Controller } from '@nestjs/common';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Crud, CrudController } from '@dataui/crud';
import { UserEntity } from '../../entities/UserEntity';
import { UserService } from '../../services/UserService';

@Crud({
	model: {
		type: UserEntity,
	},
	params: {
		publicKey: {
			field: 'publicKey',
			type: 'string',
			primary: true,
		},
	},
})
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/user`)
export class OperatorAdminApiUserController  {
	constructor(public service: UserService) {}
}