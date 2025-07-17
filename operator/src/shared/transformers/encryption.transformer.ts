import { ValueTransformer } from 'typeorm';
import { EncryptionService } from '../services/encryption.service';

export class EncryptionTransformer implements ValueTransformer {
	constructor(private encryptionServiceProvider: () => EncryptionService) {}

	to(value: string | null): string | null {
		if (!value) return null;
		return this.encryptionServiceProvider().encrypt(value);
	}

	from(value: string | null): string | null {
		if (!value) return null;
		return  this.encryptionServiceProvider().decrypt(value);
	}
}