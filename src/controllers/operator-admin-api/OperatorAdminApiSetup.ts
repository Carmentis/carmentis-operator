import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { UserEntity } from '../../entities/UserEntity';
import { Public } from '../../decorators/PublicDecorator';
import { AuthGuard } from '../../workspace/guards/AuthGuard';
import { SetupFirstUserDto } from '../../dto/SetupFirstUserDto';
import { UserService } from '../../services/UserService';

@Controller(`${OPERATOR_ADMIN_API_PREFIX}/setup`)
export class OperatorAdminApiSetup {

	constructor(private readonly userService: UserService) {}

	@Public()
	@Get("/status")
	async status() {
		return {
			isInitialized: await this.isInitialized()
		}
	}

	@Public()
	@Post()
	async setup(@Body() setupDto: SetupFirstUserDto) {
		if (await this.isInitialized()) {
			throw new BadRequestException('Server is already initialized');
		}

		const user = await this.userService.createUser(
			setupDto.publicKey,
			setupDto.pseudo
		);

		return {
			success: true,
			user: {
				publicKey: user.publicKey,
				pseudo: user.pseudo
			}
		};
	}

	async isInitialized() {
		const numberOfUsers = await UserEntity.count();
		return numberOfUsers !== 0;
	}

}
