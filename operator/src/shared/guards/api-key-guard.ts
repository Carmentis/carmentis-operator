
import {
	CanActivate,
	ExecutionContext, ForbiddenException,
	Injectable, Logger, NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { application, Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../services/api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
	private logger = new Logger(ApiKeyGuard.name);
	constructor(private apiKeyService: ApiKeyService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {

		// this guard only works for HTTP(s) requests
		const request = context.switchToHttp().getRequest();
		if (!request) return true;

		// this guard only works for request to /api/**
		const path = request.url;
		if (!path.startsWith('/api/')) return true;

		// check the validity of the key
		const key = this.extractApiKeyFromHeader(request);
		const isActive =
			key !== undefined &&
			await this.apiKeyService.isActiveKey(key);

		return isActive
	}

	private extractApiKeyFromHeader(request: Request): string | undefined {
		const headers = request.headers;
		if (!headers) return undefined;
		const authorization = headers['authorization'];
		if (!authorization) return undefined;
		const tokens = authorization.split(' ');
		if (tokens.length !== 2) return undefined;
		const [type,key] = tokens;
		return type === 'Bearer' ? key : undefined;
	}
}
