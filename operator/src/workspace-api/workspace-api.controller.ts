import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import PackageConfigService from '../package.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { OperatorSetupDto } from './dto/operator-setup.dto';
import { AdministrationService } from './services/administration.service';
import { plainToInstance } from 'class-transformer';

@Controller('/workspace/api')
export class WorkspaceApiController {

	private readonly logger: Logger = new Logger(WorkspaceApiController.name);

	constructor(
		private readonly packageConfigService: PackageConfigService,
		@InjectRepository(UserEntity)
		private adminRepository: Repository<UserEntity>,
		private readonly administrationService: AdministrationService,
	) {
	}

	@Get()
	getHello(): string {
		return 'Workspace API';
	}

	@Get('/status')
	getStatus() {
		return {
			service: 'operator',
			version: this.packageConfigService.operatorVersion,
		};
	}

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

	@Get('/setup/status')
	async getSetupStatus() {
		const adminsNumber = await this.adminRepository.count();
		return {
			initialised: adminsNumber !== 0,
		};
	}

}
