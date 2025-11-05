import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class ThrottlerGraphqlGuard extends ThrottlerGuard {
	getRequest(context: ExecutionContext) {
		const ctx = GqlExecutionContext.create(context);
		return ctx.getContext().req;
	}

	getRequestResponse(context: ExecutionContext) {
		if (context.getType() === 'http') {
			const ctx = context.switchToHttp();
			return {req: ctx.getRequest(), res: ctx.getResponse() };
		}
		const gqlCtx = GqlExecutionContext.create(context);
		const ctx = gqlCtx.getContext();
		return {req: ctx.req, res: ctx.res };
	}
}
