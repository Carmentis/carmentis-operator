import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from './AuthGuard';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserEntity } from '../../shared/entities/UserEntity';

@Injectable()
export class GraphQLJwtAuthGuard extends AuthGuard {
	private myLogger = new Logger(GraphQLJwtAuthGuard.name);

	getJwtToken(context: ExecutionContext): string | undefined {
		// manage GraphQL queries
		const ctx = GqlExecutionContext.create(context).getContext();
		const graphqlRequest = ctx.req;
		if (
			graphqlRequest &&
			'headers' in graphqlRequest &&
			'authorization' in graphqlRequest.headers
		) {
			const header = graphqlRequest.headers.authorization;
			if (typeof header === 'string') {
				const tokens = header.split(' ');
				if (tokens.length === 2) {
					const [type, token] = tokens;
					if (type === 'Bearer' && token !== '') {
						return token;
					}
				}
			}

		}
		return undefined;
	}

	attachUserToRequest(context: ExecutionContext, user: UserEntity) {
		const ctx = GqlExecutionContext.create(context).getContext();
		ctx.user = user;
	}
}