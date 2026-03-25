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


		// this guard only works for request to /api/**
		const path = request.url;
		if (!path.startsWith('/api/')) return true;

		// check the validity of the key
		const key = this.extractApiKeyFromHeader(request);
		const isActive =
			key !== undefined &&
			await this.apiKeyService.isActiveKey(key);
		
		// attach the api key to the request
		if (isActive && key) {
			const apiKey = await this.apiKeyService.findOneByKey(key);
			request.apiKey = apiKey;
		}

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
		const apiKeyHeader = headers['x-api-key']
		if (apiKeyHeader) {
			const apiKey = typeof apiKeyHeader === 'string' ? apiKeyHeader : apiKeyHeader[0];
			const trimedApiKey = apiKey.trim();
			const isEmpty = trimedApiKey.length === 0;
			return isEmpty ? undefined : trimedApiKey
		}

		return undefined

	}
}
