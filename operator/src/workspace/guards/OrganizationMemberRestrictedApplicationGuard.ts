import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable, Logger,
} from '@nestjs/common';
import { OrganisationService } from '../../shared/services/OrganisationService';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { RESOURCE_ID_KEY } from '../decorators/ResourceId';
import { UserEntity } from '../../shared/entities/UserEntity';
import { ApplicationService } from '../../shared/services/ApplicationService';

@Injectable()
export class OrganizationMemberRestrictedApplicationGuard implements CanActivate {
	private logger = new Logger(OrganizationMemberRestrictedApplicationGuard.name);
	constructor(
		private reflector: Reflector,
		private readonly service: ApplicationService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = GqlExecutionContext.create(context);
		const { user } = ctx.getContext();
		const args = ctx.getArgs();

		// reject the request if the user if not authenticated yet
		const isAuthenticated = user instanceof UserEntity;
		if (!isAuthenticated) {
			return false
		}


		const paramName =
			this.reflector.get<string>(
				RESOURCE_ID_KEY,
				context.getHandler(),
			) ?? 'id';

		const applicationId = this.extractApplicationId(args, paramName);

		// if no organization found, then it is highly a misconfiguration, log with a warning and
		if (!applicationId) {
			this.logger.warn(`Application id not found at param ${paramName}, have you correctly configure the guard?`);
			return false;
		}

		// if found, delegate to the service to decide the authorization logic
		const hasAccess = await this.service.isAuthorizedUser(
			user,
			Number.parseInt(applicationId, 10),
		);


		if (!hasAccess) {
			throw new ForbiddenException();
		}
		return true;
	}

	private extractApplicationId(
		args: Record<string, any>,
		paramName: string,
	): string | undefined {
		// 1. direct args
		if (args[paramName]) return args[paramName];

		// 2. args.input
		if (args.variables?.[paramName]) return args.variables[paramName];

		return undefined;
	}
}
