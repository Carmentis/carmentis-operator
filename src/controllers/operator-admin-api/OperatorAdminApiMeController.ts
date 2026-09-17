import { Body, Controller, Get, Patch } from '@nestjs/common';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { CurrentAdminUser } from '../../decorators/CurrentAdminUserDecorator';
import { RenamePseudoDto } from '../../dto/RenamePseudoDto';
import { UserService } from '../../services/UserService';
import { AdminJwtPayload } from '../../services/AuthTokenService';

@Controller(`${OPERATOR_ADMIN_API_PREFIX}/me`)
export class OperatorAdminApiMeController {
	constructor(private readonly userService: UserService) {}

	@Get()
	async me(@CurrentAdminUser() currentUser: AdminJwtPayload) {
		const user = await this.userService.findUserById(currentUser.sub);
		return {
			id: user.id,
			publicKey: user.publicKey,
			pseudo: user.pseudo,
			createdAt: user.createdAt,
		};
	}

	@Patch('pseudo')
	async renamePseudo(@CurrentAdminUser() currentUser: AdminJwtPayload, @Body() dto: RenamePseudoDto) {
		const user = await this.userService.renamePseudo(currentUser.sub, dto.pseudo);
		return { id: user.id, pseudo: user.pseudo };
	}
}
