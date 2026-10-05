import { BadRequestException } from '@nestjs/common';
import {
	JwkPrivateSignatureKey,
	PrivateSignatureKey,
	SignatureSchemeId,
	SignatureType,
	WalletCrypto,
} from '@cmts-dev/carmentis-sdk-core';
import { JsonSignatureService } from './JsonSignatureService';

describe('JsonSignatureService', () => {
	const service = new JsonSignatureService();
	const payload = { documentId: 'doc-42', approved: true };
	const context = { purpose: 'document-approval', target: 'https://example.com' };

	async function seedKey(): Promise<PrivateSignatureKey> {
		return WalletCrypto.generateWallet()
			.getDefaultAccountCrypto()
			.getPrivateSignatureKey(SignatureSchemeId.SECP256K1);
	}

	describe.each([
		['a seed-based key', seedKey],
		['a JWK key', () => JwkPrivateSignatureKey.gen()],
	])('json-canonical+utf8 with %s', (_, createKey) => {
		it('signs and verifies, returning the context and the payload', async () => {
			const sk = await createKey();
			const signature = await service.sign(sk, SignatureType.JSON_CANONICAL_UTF8, context, payload);

			const result = await service.verify(await sk.getPublicKey(), signature);

			expect(result).toMatchObject({ verified: true, payload });
			expect((result as any).context).toMatchObject(context);
			expect(typeof (result as any).context.signedAt).toBe('number');
		});

		it('does not verify a payload that was tampered with', async () => {
			const sk = await createKey();
			const signature = await service.sign(sk, SignatureType.JSON_CANONICAL_UTF8, context, payload, {
				includePayload: false,
			});

			const result = await service.verify(await sk.getPublicKey(), signature, { ...payload, approved: false });

			expect(result.verified).toBe(false);
		});

		it('does not verify with another key', async () => {
			const sk = await createKey();
			const signature = await service.sign(sk, SignatureType.JSON_CANONICAL_UTF8, context, payload);

			const other = await (await createKey()).getPublicKey();

			expect((await service.verify(other, signature)).verified).toBe(false);
		});

		it('reports an expired signature', async () => {
			const sk = await createKey();
			const signature = await service.sign(
				sk,
				SignatureType.JSON_CANONICAL_UTF8,
				{ ...context, notValidAfter: Date.now() - 1000 },
				payload,
			);

			expect((await service.verify(await sk.getPublicKey(), signature)).verified).toBe(false);
			// ... but it was valid at an earlier time
			expect(
				(await service.verify(await sk.getPublicKey(), signature, undefined, { verifiedAt: Date.now() - 5000 })).verified,
			).toBe(true);
		});

		it('checks that the signature allows on-chain use when asked to', async () => {
			const sk = await createKey();
			const signature = await service.sign(sk, SignatureType.JSON_CANONICAL_UTF8, context, payload);

			const result = await service.verify(await sk.getPublicKey(), signature, undefined, {
				shouldBeValidOnChain: true,
			});

			expect(result.verified).toBe(false);
		});
	});

	describe('jws', () => {
		it('signs and verifies with a JWK key', async () => {
			const sk = await JwkPrivateSignatureKey.gen();
			const signature = await service.sign(sk, SignatureType.JWS, context, payload);

			const result = await service.verify(await sk.getPublicKey(), signature);

			expect(result).toMatchObject({ verified: true, payload });
		});

		it('is refused for a seed-based key, with a clear error', async () => {
			await expect(service.sign(await seedKey(), SignatureType.JWS, context, payload)).rejects.toThrow(
				/JWK private key/,
			);
		});

		it('requires an object payload', async () => {
			const sk = await JwkPrivateSignatureKey.gen();
			await expect(service.sign(sk, SignatureType.JWS, context, 'text')).rejects.toThrow(BadRequestException);
		});
	});

	it('requires a purpose in the context', async () => {
		await expect(
			service.sign(await seedKey(), SignatureType.JSON_CANONICAL_UTF8, { target: 'x' }, payload),
		).rejects.toThrow(BadRequestException);
	});

	it('reports a malformed signature as not verified instead of failing', async () => {
		const pk = await (await seedKey()).getPublicKey();
		expect(await service.verify(pk, { signatureType: 'nope' })).toEqual({
			verified: false,
			errors: ['Malformed signature'],
		});
	});

	it('rejects an invalid verification context', async () => {
		const sk = await seedKey();
		const signature = await service.sign(sk, SignatureType.JSON_CANONICAL_UTF8, context, payload);
		await expect(
			service.verify(await sk.getPublicKey(), signature, undefined, { verifiedAt: 'yesterday' }),
		).rejects.toThrow(BadRequestException);
	});
});
