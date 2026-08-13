import { IsDefined, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { BinaryEncoding } from '../signature/BinaryEncoding';
import { JsonCanonicalizationMethod } from '../signature/JsonCanonicalizationMethod';

/**
 * Request DTO for requesting a wallet to sign a binary message.
 * The wallet will sign the provided message using its private key and return the signature.
 */
export class WalletJsonSignatureRequestDto {

	@ApiProperty({
		description: 'The JSON object to sign. Will be canonicalized before signature using the selected canonicalization method',
	})
	@IsObject()
	@IsDefined()
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

	@ApiProperty({
		description: 'Desired encoding format for the returned signature',
		enum: BinaryEncoding,
		default: BinaryEncoding.HEX,
		required: false
	})
	@IsOptional()
	@IsEnum(BinaryEncoding)
	signatureEncoding: BinaryEncoding = BinaryEncoding.HEX;
}