import { Controller, Get, Options } from '@nestjs/common';

@Controller()
export class OperatorApiController {
	constructor() {
	}

	@Get('/socket.io/')
	index() {
		return {
			success: true,
			data: {
				qrId: 'FFC12753425A51082049152035542376',
			},
		};
	}
}
