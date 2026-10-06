import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsObject, IsOptional } from 'class-validator';
import { BinaryEncoding, SignatureType } from '@cmts-dev/carmentis-sdk-core';

/** Options of the `json-canonical+utf8` signature. Ignored for `jws`. */
export class JsonSignatureOptionsDto {
	@ApiPropertyOptional({ description: 'Embed the signed payload in the returned signature object' })
	@IsOptional()
	includePayload?: boolean;

	@ApiPropertyOptional({ description: 'Embed the encoded public key in the returned signature object' })
	@IsOptional()
	includePublicKey?: boolean;

	@ApiPropertyOptional({ description: 'Encoding of the signature', enum: BinaryEncoding })
	@IsOptional()
	@IsEnum(BinaryEncoding)
	signatureEncoding?: BinaryEncoding;
}

/**
 * Request to sign a JSON payload with the key of a wallet. The signature is made by the SDK's
 * `JsonSignature` machinery: the payload is bound to a context (what it is for, who it targets,
 * how long it is valid...) that the verifier checks.
 */
export class JsonSignatureRequestDto {
	@ApiProperty({
		description: 'Format of the signature. `jws` requires a wallet backed by a JWK private key.',
		enum: SignatureType,
		example: SignatureType.JSON_CANONICAL_UTF8,
	})
	@IsEnum(SignatureType)
	signatureType: SignatureType;

	@ApiProperty({
		description:
			'Context of the signature. `purpose` is required; `signedAt` defaults to the current time. ' +
			'Dates (`signedAt`, `requestedAt`, `notValidBefore`, `notValidAfter`) are Unix timestamps in milliseconds, ' +
			'as compared by the verifier. Other optional members: `target`, `allowOnChain`, `organizationId`, ' +
			'`applicationId`, `applicationLedgerId`, `applicationLedgerLatestMicroblockHash`. Extra members are kept.',
		example: { purpose: 'document-approval', target: 'https://example.com', notValidAfter: 1893456000000 },
	})
	@IsObject()
	@IsDefined()
	context: Record<string, unknown>;

	@ApiProperty({
		description: 'The JSON payload to sign. For `jws` it must be a JSON object.',
		example: { documentId: 'doc-42', approved: true },
	})
	@IsDefined()
	payload: unknown;

	@ApiPropertyOptional({ type: JsonSignatureOptionsDto })
	@IsOptional()
	@IsObject()
	options?: JsonSignatureOptionsDto;
}
