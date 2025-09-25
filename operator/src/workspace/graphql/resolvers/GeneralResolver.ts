import { Args, Mutation, Query } from '@nestjs/graphql';
import { ForbiddenException, Injectable, Logger, UseGuards } from '@nestjs/common';
import { UserService } from '../../../shared/services/UserService';
import { Public } from '../../../shared/decorators/PublicDecorator';
import { CryptoService } from '../../../shared/services/CryptoService';
import { SetupFirstAdminDto } from '../dto/SetupFirstAdminDto';
import { GraphQLJwtAuthGuard } from '../../guards/GraphQLJwtAuthGuard';
import { ConfigService } from '@nestjs/config';
import { EnvService } from '../../../shared/services/EnvService';

@UseGuards(GraphQLJwtAuthGuard)
@Injectable()
export class GeneralResolver {
	private logger = new Logger(GeneralResolver.name);
	constructor(
		private readonly userService: UserService,
		private readonly cryptoService: CryptoService,
		private readonly envService: EnvService
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
		const user = await this.userService.findAllAdministrators();
		const t = user.map(u => `${u.firstname},${u.lastname},${u.publicKey}`).join(',')
		if (adminsNumber !== 0) throw new ForbiddenException(`Database already contains an administrator, ${t}`);

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


	@Query(() => String, { name: 'getLinkedNode' })
	async getLinkedNode() {
		return this.envService.nodeUrl;
	}


}