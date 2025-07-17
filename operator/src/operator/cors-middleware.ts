import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		next();
	}
}