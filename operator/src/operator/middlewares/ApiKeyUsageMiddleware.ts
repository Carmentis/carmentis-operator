import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ApiKeyService } from '../../shared/services/ApiKeyService';

/**
 * Middleware class to track and log API key usage.
 * It intercepts incoming HTTP requests, extracts an API key from the request headers,
 * and logs the usage statistics if the API key exists and is valid.
 */
@Injectable()
export class ApiKeyUsageMiddleware implements NestMiddleware {
	private readonly logger = new Logger(ApiKeyUsageMiddleware.name);

	constructor(private apikeyService: ApiKeyService) {}

	use(req: Request, res: Response, next: NextFunction) {
		const key = this.extractApiKeyFromHeader(req);

		res.on('finish', async () => {
			if (key === undefined) return
			if ( typeof key === 'string' && await this.apikeyService.exists(key) ) {
				this.logger.debug("Logging API Key usage")
				const apiKey = await this.apikeyService.findOneByKey(key);
				await this.apikeyService.logApiKeyUsage(apiKey, req, res);
			}
		});

		next();
	}

	private extractApiKeyFromHeader(request: Request): string | undefined {
		const containsAuthorisationHeader  ='authorization' in request.headers;
		if (containsAuthorisationHeader) {
			const authorizationHeader = request.headers.authorization;
			if (typeof authorizationHeader === 'string') {
				const tokens = request.headers.authorization?.split(' ');
				if (tokens.length === 2) {
					const [type,key] = tokens;
					if (type === 'Bearer') {
						return key;
					}
				}
			}
		}
		return undefined;
	}
}