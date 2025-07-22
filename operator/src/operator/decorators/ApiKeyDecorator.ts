import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ApiKey = createParamDecorator(
	(_, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest();
		return request.apiKey;
	},
);