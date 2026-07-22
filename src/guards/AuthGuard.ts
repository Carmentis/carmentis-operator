import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ApiKeyService } from '../services/ApiKeyService';
import { IS_PUBLIC_KEY } from '../decorators/PublicDecorator';

@Injectable()
export class AuthGuard implements CanActivate {
	private logger = new Logger(AuthGuard.name);

	constructor(
		private apiKeyService: ApiKeyService,
		private jwtService: JwtService,
		private reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		if (!request) return true;

		// Check if the route is marked as public
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) return true;

		// Try JWT authentication for /admin/api/** routes
		const path = request.url;
		if (path.startsWith('/admin/api/')) {
			try {
				const token = this.extractTokenFromHeader(request);
				if (token) {
					const payload = await this.jwtService.verifyAsync(token);
					request['user'] = payload;
					return true;
				}
			} catch (error) {
				this.logger.debug('JWT authentication failed');
			}
		}

		// Try API key authentication
		try {
			const apiKey = this.extractApiKeyFromHeader(request);
			if (apiKey) {
				const isActive = await this.apiKeyService.isActiveKey(apiKey);
				if (isActive) {
					const apiKeyEntity = await this.apiKeyService.findOneByKey(apiKey);

					// Validate endpoint regex if defined
					if (apiKeyEntity.endpointRegex) {
						const endpoint = request.path;
						const regex = new RegExp(apiKeyEntity.endpointRegex);
						if (!regex.test(endpoint)) {
							this.logger.debug(`Endpoint ${endpoint} does not match allowed regex pattern`);
							return false;
						}
					}

					request.apiKey = apiKeyEntity;
					return true;
				}
			}
		} catch (error) {
			this.logger.debug('API key authentication failed');
		}

		// For /admin/api/** routes, throw Unauthorized if no valid authentication
		if (path.startsWith('/admin/api/')) {
			throw new UnauthorizedException();
		}

		// For other routes, return false if no valid authentication
		return false;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const auth = request.headers['authorization'];
		if (!auth) return undefined;
		const [type, token] = auth.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}

	private extractApiKeyFromHeader(request: Request): string | undefined {
		const headers = request.headers;
		if (!headers) return undefined;

		// Search in authorization header with Bearer prefix
		const authorization = headers['authorization'];
		if (authorization) {
			const tokens = authorization.split(' ');
			if (tokens.length === 2) {
				const [type, key] = tokens;
				if (type === 'Bearer') {
					return key;
				}
			}
		}

		// Search in x-api-key header
		const supportedHeaders = ['x-api-key', 'X-API-KEY'];
		for (const header of supportedHeaders) {
			const apiKeyHeader = headers[header];
			if (apiKeyHeader) {
				const apiKey = typeof apiKeyHeader === 'string' ? apiKeyHeader : apiKeyHeader[0];
				const trimedApiKey = apiKey.trim();
				return trimedApiKey.length > 0 ? trimedApiKey : undefined;
			}
		}

		return undefined;
	}
}