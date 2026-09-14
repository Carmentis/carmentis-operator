import { IsNotEmpty, IsObject } from 'class-validator';

/**
 * Wraps the raw JSON produced by the browser's `navigator.credentials.create()`/`.get()`
 * (via the WebAuthn `PublicKeyCredential.toJSON()` shape). Deep validation of its content
 * is delegated to @simplewebauthn/server during verification.
 */
export class WebauthnResponseDto {
	@IsObject()
	@IsNotEmpty()
	readonly response: Record<string, unknown>;
}
