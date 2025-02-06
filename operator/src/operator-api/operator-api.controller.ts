import { Body, Controller, Logger, Post } from '@nestjs/common';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
import { Public } from '../workspace-api/decorators/public.decorator';
import { CryptoService } from './services/crypto.service';

@Controller()
export class OperatorApiController{

	private logger = new Logger(OperatorApiController.name);

	constructor(
	) {
	}


	@Public()
	@Post("/eventApproval")
	async handleRequest(
		@Body() data: object
	) {
		this.logger.log("Handling event approval")

		sdk.operatorCore.prepareUserApproval(data);
	}
}