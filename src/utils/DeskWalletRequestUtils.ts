import { WalletRequestEncoder, WalletRequestType, WalletRequestValidation } from '@cmts-dev/carmentis-sdk-core';

/**
 * Rebuilds, byte-for-byte, the message a Carmentis wallet signs when answering a `wr-auth-pk`
 * ("authenticate by public key") request for a given challenge.
 *
 * This is deliberately NOT the raw challenge bytes. `@cmts-dev/carmentis-sdk-core` ships a
 * purpose-built `WalletRequestEncoder`/`WalletRequestValidation` pair together with matching
 * `WalletRequestAuthByPublicKeySchema` / `WalletResponseAuthByPublicKeySchema` types (the latter
 * being exactly `{ publicKey, signature }`, i.e. what a Desk `wr-auth-pk` response carries) — this
 * is the SDK's own canonical wire format for this exact request/response pair, not a guess.
 *
 * Verified empirically (no live Carmentis Desk instance was available to test against, so this
 * should still be smoke-tested against one before relying on it in production): encoding
 * `{ type: AUTH_BY_PUBLIC_KEY, base64EncodedChallenge }` with `WalletRequestEncoder.encodeRequest`
 * produces deterministic CBOR bytes, distinct from the raw challenge bytes, from the challenge
 * string's UTF-8 bytes, and from plain JSON. Signing those CBOR bytes with a real
 * `WalletCrypto`-generated key and verifying the signature back with
 * `CryptoEncoderFactory.defaultStringSignatureEncoder()` succeeds; verifying the raw challenge
 * bytes instead fails. This confirms the CBOR-encoded, type-tagged request — not the bare
 * challenge — is what must be signed and verified.
 */
export function encodeAuthChallengeRequest(base64EncodedChallenge: string): Uint8Array {
	const request = WalletRequestValidation.validateWalletRequest({
		type: WalletRequestType.AUTH_BY_PUBLIC_KEY,
		base64EncodedChallenge,
	});
	return WalletRequestEncoder.encodeRequest(request);
}
