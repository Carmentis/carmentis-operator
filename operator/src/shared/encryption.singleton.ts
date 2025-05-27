import { EncryptionService } from './services/encryption.service';

export class EncryptionServiceProxy {
	private static _instance: EncryptionService;

	static setInstance(instance: EncryptionService) {
		this._instance = instance;
	}

	static get instance(): EncryptionService {
		if (!this._instance) {
			throw new Error('EncryptionService not initialized yet');
		}
		return this._instance;
	}
}