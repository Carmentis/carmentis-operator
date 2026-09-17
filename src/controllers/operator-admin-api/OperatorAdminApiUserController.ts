import { Controller, Delete, ForbiddenException, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Crud } from '@dataui/crud';
import { UserEntity } from '../../entities/UserEntity';
import { UserService } from '../../services/UserService';
import { CurrentAdminUser } from '../../decorators/CurrentAdminUserDecorator';
import { AdminJwtPayload } from '../../services/AuthTokenService';

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
		only: ['getManyBase', 'getOneBase'],
	},
})
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/user`)
export class OperatorAdminApiUserController {
	constructor(public service: UserService) {}

	@Delete(':id')
	async deleteUser(
		@Param('id', ParseIntPipe) userId: number,
		@CurrentAdminUser() currentUser: AdminJwtPayload,
	) {
		if (userId === currentUser.sub) {
			throw new ForbiddenException('You cannot delete your own account');
		}
		return this.service.deleteUserById(userId);
	}
}
