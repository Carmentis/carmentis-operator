import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { EnvService } from './env.service';

@Injectable()
export class EncryptionService {
	private readonly algorithm = 'chacha20-poly1305';
	private readonly ivLength = 12;

	constructor(private readonly envService: EnvService) {}

	encrypt(value: string): string {
		const key = this.envService.dbEncryptionKey;
		const iv = crypto.randomBytes(this.ivLength);
		const cipher = crypto.createCipheriv(this.algorithm, key, iv);

		const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
		const tag = cipher.getAuthTag();

		return Buffer.concat([iv, tag, encrypted]).toString('base64');
	}

	decrypt(payload: string): string {
		const key = this.envService.dbEncryptionKey;
		const data = Buffer.from(payload, 'base64');
		const iv = data.subarray(0, this.ivLength);
		const tag = data.subarray(this.ivLength, this.ivLength + 16);
		const encrypted = data.subarray(this.ivLength + 16);

		const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
		decipher.setAuthTag(tag);

		return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
	}
}