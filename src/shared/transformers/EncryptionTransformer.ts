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
		// Only objects and arrays are JSON-decoded: parsing every value would turn a plain
		// string such as "1234" or "true" into a number or a boolean.
		const trimmed = plaintext.trimStart();
		if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
			try {
				return JSON.parse(plaintext);
			} catch (error) {
				return plaintext;
			}
		}
		return plaintext;
	}
}