import { ValueTransformer } from 'typeorm';
import { EncryptionService } from '../../services/EncryptionService';

export class EncryptionTransformer implements ValueTransformer {
	constructor(private encryptionServiceProvider: () => EncryptionService) {}

	to(value: string | null | object): string | null {
		if (!value) return null;
		const encryptionService = this.encryptionServiceProvider();
		if (typeof value === 'object') {
			return encryptionService.encrypt(JSON.stringify(value));
		} else {
			return encryptionService.encrypt(value);
		}
	}

	from(ciphertext: string | null): string | object | null {
		if (!ciphertext) return null;
		const plaintext = this.encryptionServiceProvider().decrypt(ciphertext);
		try {
			return JSON.parse(plaintext);
		} catch (error) {
			return plaintext;
		}
	}
}