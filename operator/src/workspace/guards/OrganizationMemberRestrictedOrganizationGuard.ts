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
import { AuthorizationService } from '../../shared/services/AuthorizationService';

@Injectable()
export class OrganizationMemberRestrictedOrganizationGuard implements CanActivate {
	private logger = new Logger(OrganizationMemberRestrictedOrganizationGuard.name);
	constructor(
		private reflector: Reflector,
		private readonly authService: AuthorizationService
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

		// récupère le nom du champ défini par le décorateur (ou fallback à "organisationId")
		const paramName =
			this.reflector.get<string>(
				RESOURCE_ID_KEY,
				context.getHandler(),
			) ?? 'organisationId';

		const organisationId = this.extractOrganisationId(args, paramName);

		// if no organization found, then it is highly a misconfiguration, log with a warning and
		if (!organisationId) {
			this.logger.warn(`Organisation id not found at param ${paramName}, have you correctly configure the guard?`);
			return false;
		}

		// if found, delegate to the service to decide the authorization logic
		const hasAccess = await this.authService.isAuthorizedToAccessOrganization(
			user,
			Number.parseInt(organisationId, 10),
		);


		if (!hasAccess) {
			throw new ForbiddenException();
		}
		return true;
	}

	private extractOrganisationId(
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
