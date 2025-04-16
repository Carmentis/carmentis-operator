import { Args, Mutation, Query } from '@nestjs/graphql';
import { ForbiddenException, Injectable, Logger, UseGuards } from '@nestjs/common';
import { UserService } from '../../services/user.service';
import { GraphQLJwtAuthGuard } from '../../../workspace/guards/authentication.guards';
import { Public } from '../../../workspace/decorators/public.decorator';
import { UserEntity } from '../../entities/user.entity';
import { CryptoService } from '../../services/crypto.service';
import { SetupFirstAdminDto } from '../dto/setup-first-admin.dto';

@UseGuards(GraphQLJwtAuthGuard)
@Injectable()
export class GeneralResolver {
	private logger = new Logger(GeneralResolver.name);
	constructor(
		private readonly userService: UserService,
		private readonly cryptoService: CryptoService
	) {}

	@Public()
	@Query(() => Boolean, { name: 'isInitialised' })
	async getInitialisationStatus() {
		const adminsNumber = await this.userService.countAdministrators();
		return adminsNumber !== 0;
	}

	@Public()
	@Mutation(() => Boolean, { name: 'setupFirstAdministrator' })
	async setupFirstAdministrator(
		@Args('setupFirstAdmin',{ type: () => SetupFirstAdminDto }) data: SetupFirstAdminDto
	) {
		// ignore the request if there is at least one admin
		const adminsNumber = await this.userService.countAdministrators();
		if (adminsNumber !== 0) throw new ForbiddenException();

		// accept the request only if the provided token is valid
		if (data.token !== this.cryptoService.adminCreationToken) {
			this.logger.log("Ignoring setup request: Invalid token")
			throw new ForbiddenException();
		}

		this.logger.debug("Creating first administrator")
		await this.userService.createAdministrator({
            publicKey: data.publicKey,
            firstname: data.firstname,
            lastname: data.lastname,
			isAdmin: true
        });

		return true;
	}

}