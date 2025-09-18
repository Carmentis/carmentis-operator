import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../shared/services/UserService';
import { UserEntity } from '../../shared/entities/UserEntity';
import { IS_PUBLIC_KEY } from '../../shared/decorators/PublicDecorator';
import { StringSignatureEncoder } from '@cmts-dev/carmentis-sdk/server';

@Injectable()
export abstract class AuthGuard implements CanActivate {
	private logger = new Logger(AuthGuard.name);

	constructor(private jwtService: JwtService, private reflector: Reflector, private userService: UserService) {
	}

	abstract getJwtToken(context: ExecutionContext): string | undefined;

	abstract attachUserToRequest(context: ExecutionContext, user: UserEntity);

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// do not protect if marked as public
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			return true;
		}


		// reject the request either if no token is provided
		const token = this.getJwtToken(context);
		if (token === undefined) {
			this.logger.debug(`Token ${token} not found`);
			return false;
		}


		// reject the request if the token is not verified or if the token is malformed
		try {
			const payload: { publicKey?: string } = this.jwtService.verify(token);
			if (payload.publicKey) {
				const user = await this.userService.findOneByPublicKey(payload.publicKey);
				if (user) {
					this.attachUserToRequest(context, user);
					return true;
				} else {
					this.logger.debug(`Authentication request requested for token ${token}: no user associated with public key ${payload.publicKey}`);
				}
			} else {
				this.logger.debug(`Authentication request requested for token ${token}: no public key found`);
			}
			return false;
		} catch {
			this.logger.debug(`Authentication request requested for token ${token}: not found`);
			return false;
		}
	}

}