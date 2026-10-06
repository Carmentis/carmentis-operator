import { BadRequestException } from '@nestjs/common';
import { JwkPrivateSignatureKey, SignatureSchemeId, SeedEncoder, WalletCrypto } from '@cmts-dev/carmentis-sdk-core';
import { PrivateKeyService } from './PrivateKeyService';
import { PrivateKeyObjectType } from '../types/types';

describe('PrivateKeyService.parseAndValidate', () => {
	const service = new PrivateKeyService();

	it('accepts a seed-based key', async () => {
		const seed = WalletCrypto.generateWallet().encode(new SeedEncoder());
		const key = { keyType: PrivateKeyObjectType.SEED, schemeId: SignatureSchemeId.SECP256K1, seed };
		await expect(service.parseAndValidate(key)).resolves.toEqual(key);
	});

	it('accepts a JWK private key', async () => {
		const jwk = (await JwkPrivateSignatureKey.gen()).getPrivateJwk();
		await expect(service.parseAndValidate({ keyType: PrivateKeyObjectType.JWK, jwk })).resolves.toBeDefined();
	});

	it('rejects a public-only JWK', async () => {
		const jwk = (await JwkPrivateSignatureKey.gen()).getPublicJwk();
		await expect(service.parseAndValidate({ keyType: PrivateKeyObjectType.JWK, jwk })).rejects.toThrow(
			BadRequestException,
		);
	});

	it('rejects a malformed seed and an unknown key type', async () => {
		await expect(
			service.parseAndValidate({ keyType: PrivateKeyObjectType.SEED, schemeId: SignatureSchemeId.SECP256K1, seed: 'not a seed' }),
		).rejects.toThrow(BadRequestException);
		await expect(service.parseAndValidate({ keyType: 'OTHER' })).rejects.toThrow(BadRequestException);
	});
});
