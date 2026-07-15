import { CryptoEncoderFactory, PublicSignatureKey } from '@cmts-dev/carmentis-sdk-core';
import { Verifier } from '@sd-jwt/core';
import { importJWK, base64url } from 'jose';

export class CryptoUtils {
	static async decodePublicSignatureKey(publicKey: string) {
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		return encoder.decodePublicKey(publicKey);
	}

	static async convertCryptoKeyToJwk(pk: CryptoKey) {
		return crypto.subtle.exportKey('jwk', pk);
	}

	static async createSdJwtVerifierFromJwk(jwk: JsonWebKey): Promise<Verifier> {
		const publicKey = await importJWK(jwk, 'EdDSA', {
			extractable: true,
		}) as CryptoKey;
		return async (data: string, signature: string) => {
			const encoder = new TextEncoder();
			const rawData = encoder.encode(data);
			const sig = await crypto.subtle.verify(
				{ name: 'Ed25519' },
				publicKey,
				Buffer.from(base64url.decode(signature)),
				rawData,
			);
			return sig;
		};
	}

	static async createSdJwtVerifierFromPublicKey(publicKey: PublicSignatureKey): Promise<Verifier> {
		return async (data: string, signature: string) => {
			const message = Buffer.from(data, 'utf-8');
			const sig = Buffer.from(signature, 'base64url');
			return await publicKey.verify(message, sig);
		};
	}
}