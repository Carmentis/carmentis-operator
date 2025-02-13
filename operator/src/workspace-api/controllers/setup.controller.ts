import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post, SetMetadata } from '@nestjs/common';
import PackageConfigService from '../../package.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../shared/entities/user.entity';
import { Repository } from 'typeorm';
import { AdministrationService } from '../../shared/services/administration.service';
import { OperatorSetupDto } from '../dto/operator-setup.dto';
import { plainToInstance } from 'class-transformer';
import { Public } from '../decorators/public.decorator';

@Controller("/workspace/api")
export class SetupController {
	private readonly logger: Logger = new Logger(SetupController.name);

	constructor(
		private readonly packageConfigService: PackageConfigService,
		@InjectRepository(UserEntity)
		private adminRepository: Repository<UserEntity>,
		private readonly administrationService: AdministrationService,
	) {
	}

	@Public()
	@Post('/setup')
	async setup(@Body() data: OperatorSetupDto) {
		// if at least one administrator registered, abort
		const adminsNumber = await this.adminRepository.count();
		if (adminsNumber !== 0) {
			throw new HttpException(
				'Setup already performed',
				HttpStatus.FORBIDDEN,
			);
		}

		// insert the administrator in database
		this.logger.log(`Setup done using public key ${data.publicKey}`);
		const admin: UserEntity = plainToInstance(
			UserEntity,
			data,
		);
		admin.isAdmin = true;

		await this.administrationService.createAdministrator(admin);

		return { 'success': true };
	}

	@Public()
	@Get('/setup/status')
	async getSetupStatus() {
		const adminsNumber = await this.adminRepository.count();
		return {
			initialised: adminsNumber !== 0,
		};
	}

}