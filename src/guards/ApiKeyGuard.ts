import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../services/ApiKeyService';

@Injectable()
export class ApiKeyGuard implements CanActivate {
	private logger = new Logger(ApiKeyGuard.name);

	constructor(
		private apiKeyService: ApiKeyService,
		private reflector: Reflector,
	) {
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// this guard only works for HTTP(s) requests
		const request = context.switchToHttp().getRequest();
		if (!request) return true;
		
		// if the request is marked as public, return true
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			'isPublic',
			[
				context.getHandler(),
				context.getClass(),
			],
		);
		if (isPublic) return true;


		// this guard works for all requests, not only /api/**
		//const path = request.url;
		//if (!path.startsWith('/api/')) return true;

		// check the validity of the key
		const key = this.extractApiKeyFromHeader(request);
		const isActive =
			key !== undefined &&
			await this.apiKeyService.isActiveKey(key);

		// attach the api key to the request
		if (isActive && key) {
			this.logger.debug("API key is active")
			const apiKey = await this.apiKeyService.findOneByKey(key);

			// validate endpoint regex if defined
			if (apiKey.endpointRegex) {
				const endpoint = request.path;
				const regex = new RegExp(apiKey.endpointRegex);
				if (!regex.test(endpoint)) {
					this.logger.debug(`Endpoint ${endpoint} does not match allowed regex pattern`);
					return false;
				}
			} else {
				this.logger.debug("Endpoint regex is not defined: All routes enabled")
			}

			request.apiKey = apiKey;
		} else {
			this.logger.debug("API key is invalid or inactive")
		}

		this.logger.debug(`API key verification result: ${isActive}`)
		return isActive
	}

	private extractApiKeyFromHeader(request: Request): string | undefined {
		const headers = request.headers;
		if (!headers) return undefined;

		// search in authorization
		const authorization = headers['authorization'];
		if (authorization) {
			const tokens = authorization.split(' ');
			if (tokens.length !== 2) return undefined;
			const [type,key] = tokens;
			return type === 'Bearer' ? key : undefined;
		}

		// search in x-api-key header
		const supportedHeaders = ['x-api-key', 'X-API-KEY']
		for (const header of supportedHeaders) {
			const apiKeyHeader = headers[header]
			if (apiKeyHeader) {
				const apiKey = typeof apiKeyHeader === 'string' ? apiKeyHeader : apiKeyHeader[0];
				const trimedApiKey = apiKey.trim();
				const isEmpty = trimedApiKey.length === 0;
				return isEmpty ? undefined : trimedApiKey
			}
		}

		return undefined

	}
}
