import { Controller, Get } from '@nestjs/common';

@Controller()
export class OperatorHealthApiController {
	@Get('/health')
	health() {
		return {
			status: 'ok'
		}
	}
}