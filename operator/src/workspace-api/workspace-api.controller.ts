import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import PackageConfigService from '../package.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { AdministrationService } from './services/administration.service';

@Controller('/workspace/api')
export class WorkspaceApiController {


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

}
