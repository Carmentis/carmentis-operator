import { BadRequestException, Injectable } from '@nestjs/common';
import * as v from 'valibot';
import {
	JsonCanonicalUtf8Signer,
	JsonSignatureParser,
	JsonSignatureVerifier,
	JwkPrivateSignatureKey,
	JwsSigner,
	PrivateSignatureKey,
	PublicSignatureKey,
	SignatureContextSchema,
	SignatureType,
	SignatureVerification,
	SignatureVerificationContextSchema,
	SignatureVerificationUtils,
} from '@cmts-dev/carmentis-sdk-core';
import { JsonSignatureOptionsDto } from '../dto/signature/JsonSignatureRequestDto';

/**
 * Signs and verifies JSON payloads with the SDK's `JsonSignature` support, which binds a
 * payload to a signature context (purpose, target, validity window...) that is checked at
 * verification. Two formats are supported: `json-canonical+utf8` and `jws`.
 */
@Injectable()
export class JsonSignatureService {

	/**
	 * Signs `payload` in the given context.
	 *
	 * @throws BadRequestException If the context is invalid, or `jws` is asked for a key that
	 * is not a JWK private key (the SDK's JWS signer only supports those).
	 */
	async sign(
		sk: PrivateSignatureKey,
		signatureType: SignatureType,
		context: unknown,
		payload: unknown,
		options: JsonSignatureOptionsDto = {},
	) {
		const validContext = this.parseContext(context);

		if (signatureType === SignatureType.JWS) {
			if (!(sk instanceof JwkPrivateSignatureKey)) {
				throw new BadRequestException(
					'JWS signatures require a wallet backed by a JWK private key; use json-canonical+utf8 for this wallet',
				);
			}
			if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
				throw new BadRequestException('The payload of a JWS signature must be a JSON object');
			}
			return new JwsSigner().sign(sk, validContext, payload as Record<string, unknown>);
		}

		const signer = new JsonCanonicalUtf8Signer();
		if (options.includePayload !== undefined) signer.setIncludePayload(options.includePayload);
		if (options.includePublicKey !== undefined) signer.setIncludePublicKey(options.includePublicKey);
		if (options.signatureEncoding !== undefined) signer.setSignatureEncoding(options.signatureEncoding);
		return signer.sign(sk, validContext, payload);
	}

	/**
	 * Verifies a signature object and the context it carries. A signature that cannot be
	 * parsed is reported as not verified, like any other invalid signature.
	 */
	async verify(
		pk: PublicSignatureKey,
		signature: unknown,
		payload?: unknown,
		verificationContext?: unknown,
	): Promise<SignatureVerification> {
		const parsedContext = v.safeParse(SignatureVerificationContextSchema, verificationContext ?? {});
		if (!parsedContext.success) {
			throw new BadRequestException(
				`Invalid verification context: ${parsedContext.issues.map(issue => issue.message).join('; ')}`,
			);
		}

		let parsedSignature;
		try {
			parsedSignature = JsonSignatureParser.parse(signature);
		} catch {
			return SignatureVerificationUtils.malformed();
		}

		const verifier = new JsonSignatureVerifier();
		if (payload !== undefined) verifier.setPayload(payload);
		return verifier.verify(pk, parsedSignature, parsedContext.output);
	}

	/** Validates the context and stamps `signedAt` with the current time when absent. */
	private parseContext(context: unknown) {
		const candidate = { signedAt: Date.now(), ...(context as object) };
		const parsed = v.safeParse(SignatureContextSchema, candidate);
		if (!parsed.success) {
			throw new BadRequestException(
				`Invalid signature context: ${parsed.issues.map(issue => issue.message).join('; ')}`,
			);
		}
		return parsed.output;
	}
}
