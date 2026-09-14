import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OperatorConfigService } from '../config/services/operator-config.service';
import { UserEntity } from '../entities/UserEntity';

export interface AdminJwtPayload {
	sub: number;
	pseudo: string;
	email: string | null;
}

@Injectable()
export class AuthTokenService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly config: OperatorConfigService,
	) {}

	buildPayload(user: UserEntity): AdminJwtPayload {
		return {
			sub: user.id,
			pseudo: user.pseudo,
			email: user.email ?? null,
		};
	}

	issueToken(user: UserEntity): { token: string; expiresAt: string } {
		const payload = this.buildPayload(user);
		const token = this.jwtService.sign(payload);
		const expiresAt = new Date(
			Date.now() + this.config.getJwtTokenValidity() * 1000,
		).toISOString();
		return { token, expiresAt };
	}
}
