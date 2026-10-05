import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * Request to verify a JSON signature produced by the SDK (`json-canonical+utf8` or `jws`), such
 * as the one returned by the sign endpoint.
 */
export class JsonSignatureVerificationRequestDto {
	@ApiProperty({
		description: 'The signature object, as returned by the sign endpoint',
		example: {
			signatureType: 'json-canonical+utf8',
			signature: '69e2b5…',
			context: { signedAt: 1767225600000, purpose: 'document-approval' },
		},
	})
	@IsObject()
	signature: Record<string, unknown>;

	@ApiPropertyOptional({
		description: 'The signed payload, when the signature object does not embed it',
	})
	@IsOptional()
	payload?: unknown;

	@ApiPropertyOptional({
		description:
			'Verification context: `verifiedAt` (Unix timestamp in milliseconds, defaults to now) and `shouldBeValidOnChain` ' +
			'(when set, must match the `allowOnChain` of the signature context).',
		example: { shouldBeValidOnChain: false },
	})
	@IsOptional()
	@IsObject()
	verificationContext?: Record<string, unknown>;
}

/** Same as {@link JsonSignatureVerificationRequestDto}, for a key that is not a wallet key. */
export class JsonSignatureVerificationWithPublicKeyRequestDto extends JsonSignatureVerificationRequestDto {
	@ApiProperty({
		description: 'The encoded public signature key (e.g. `sig:secp256k1:pk:…`) the signature is verified with',
		example: 'sig:secp256k1:pk:02910a6b3d5dd9241c528f23d9723c61ddd1b1ee632df4ce47e8992392ad561b44',
	})
	@IsString()
	@IsNotEmpty()
	publicKey: string;
}
