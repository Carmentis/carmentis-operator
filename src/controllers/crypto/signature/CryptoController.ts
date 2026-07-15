import { Controller, Get } from '@nestjs/common';
import crypto from 'crypto';

@Controller('/api/crypto')
export class CryptoController {
	@Get('/challenge')
	async generateChallenge() {
		const challenge = crypto.randomBytes(32).toString('base64url');
		return { challenge }
	}

	@Get('/nonce')
	async generateNonce() {
		const nonce = crypto.randomBytes(16).toString('base64url');
		return { nonce }
	}

	@Get('/uuid')
	async generateUuid() {
		return { uuid: crypto.randomUUID() }
	}
}