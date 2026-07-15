import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { BaseSignatureVerificationRequestDto } from './BaseSignatureVerificationRequestDto';
import { JsonCanonicalizationMethod } from './JsonCanonicalizationMethod';

/**
 * Request DTO for verifying signatures over JSON objects.
 * The JSON object is canonicalized (per RFC 8785) before verification,
 * ensuring consistent byte representation regardless of formatting.
 *
 * @example
 * {
 *   "signature": "3045022100e8af1ba0...",
 *   "publicKey": "04a1b2c3d4e5f6a7...",
 *   "message": {
 *     "sub": "user@example.com",
 *     "iss": "https://issuer.example.com",
 *     "aud": "api.example.com"
 *   },
 *   "canonicalizationMethod": "json-canonical",
 *   "signatureEncoding": "hex"
 * }
 */
export class JsonMessageSignatureVerificationRequestDto extends BaseSignatureVerificationRequestDto {
	@ApiProperty({
		description: 'The JSON object to verify. Will be canonicalized before signature verification using the selected canonicalization method',
	})
	@IsObject()
	@IsNotEmpty()
	message: object;

	@ApiProperty({
		description: 'The method used to canonicalize the JSON object before verification',
		enum: JsonCanonicalizationMethod,
		default: JsonCanonicalizationMethod.JSON_CANONICAL,
		required: false,
	})
	@IsOptional()
	@IsEnum(JsonCanonicalizationMethod)
	canonicalizationMethod: JsonCanonicalizationMethod =
		JsonCanonicalizationMethod.JSON_CANONICAL;
}