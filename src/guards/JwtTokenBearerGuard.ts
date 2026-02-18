import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/PublicDecorator';

@Injectable()
export class JwtTokenBearerGuard implements CanActivate {
	constructor(private jwtService: JwtService, private reflector: Reflector) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {

		// we ignore public routes
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) return true;


		// this guard only works for request to /admin/api/**
		const request = context.switchToHttp().getRequest();
		const path = request.url;
		if (!path.startsWith('/admin/api/')) return true;

		const token = this.extractTokenFromHeader(request);
		if (!token) {
			throw new UnauthorizedException();
		}
		try {
			// 💡 Here the JWT secret key that's used for verifying the payload
			// is the key that was passsed in the JwtModule
			const payload = await this.jwtService.verifyAsync(token);
			// 💡 We're assigning the payload to the request object here
			// so that we can access it in our route handlers
			request['user'] = payload;
		} catch {
			throw new UnauthorizedException();
		}
		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const auth = request.headers["authorization"];
		if (!auth) return undefined;
		const [type, token] = auth.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}