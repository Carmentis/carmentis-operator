import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Crud } from '@dataui/crud';
import { UserEntity } from '../../entities/UserEntity';
import { UserService } from '../../services/UserService';

@ApiTags('Admin User Management')
@Crud({
	model: {
		type: UserEntity,
	},
	params: {
		id: {
			field: 'id',
			type: 'number',
			primary: true,
		},
	},
	routes: {
		only: ['getManyBase', 'getOneBase', 'deleteOneBase'],
	},
})
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/user`)
export class OperatorAdminApiUserController {
	constructor(public service: UserService) {}
}
