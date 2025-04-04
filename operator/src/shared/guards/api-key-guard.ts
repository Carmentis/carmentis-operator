
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { application, Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../services/api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
	constructor(private apiKeyService: ApiKeyService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const path = request.url;

		if (path.startsWith('/api')) {
			const request = context.switchToHttp().getRequest();
			const key = this.extractApiKeyFromHeader(request);
			const isActive =
				key !== undefined &&
				await this.apiKeyService.isActiveKey(key);
			if (!isActive) return false;
		}
		return true;
	}

	private extractApiKeyFromHeader(request: Request): string | undefined {
		const tokens = request.headers.authorization?.split(' ');
		if (tokens.length !== 2) return undefined;
		const [type,key] = tokens;
		return type === 'Bearer' ? key : undefined;
	}
}
