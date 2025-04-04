import { Crud, CrudRequest, Override, ParsedBody, ParsedRequest } from '@nestjsx/crud';
import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Logger,
	Param,
	Post, Put, Query,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { ApiKeyService } from '../../shared/services/api-key.service';
import { ApplicationService } from '../../shared/services/application.service';
import { ApiKeyEntity } from '../../shared/entities/api-key.entity';
import { ApiKeyCreationDto } from '../dto/api-key-creation.dto';
import { ApiKeyUpdateDto } from '../dto/api-key-update.dto';

const BASE_URL_ENDPOINT = "/workspace/api/apiKeys"
@UseInterceptors(ClassSerializerInterceptor)
@Controller(BASE_URL_ENDPOINT)
export class ApiKeyController {
	private logger = new Logger(ApiKeyService.name);

	constructor(
		private service: ApiKeyService,
		private applicationService: ApplicationService
	) {
	}

	@Delete('/:apiKey')
	async deleteKey(
		@Param('apiKey') apiKey: string,
	) {
		const key = await this.service.deleteKey(apiKey)
	}


	@Get('/:apiKey/usage')
	async getKeyUsages(
		@Param('apiKey') apiKey: string,
		@Query('offset') offset: number = 0,
		@Query('limit') limit: number = 10,
		@Query('filterByUnauthorized') filterByUnauthorized: string = 'false',
	) {
		const unauthorizedOnly = filterByUnauthorized === 'true' ? true: false;
		const countRequest = this.service.countsKeyUsagesByKeyId(parseInt(apiKey),unauthorizedOnly );
		const resultsRequest = this.service.findKeyUsagesByKeyId(parseInt(apiKey), offset, limit,unauthorizedOnly )
		const [count, usage] = await Promise.all([countRequest, resultsRequest]);
		return { count, offset, limit, results: usage }
	}

	@Get('/:apiKey')
	async getKey(
		@Param('apiKey') apiKey: string,
	) {
		return this.service.findOne({ where: { id: parseInt(apiKey) } });
	}

	@Put('/:apiKey')
	async updateKey(
		@Param('apiKey') apiKey: string,
		@Body() updateKey: ApiKeyUpdateDto
 	) {
		return this.service.updateKey(parseInt(apiKey), updateKey);
	}
}