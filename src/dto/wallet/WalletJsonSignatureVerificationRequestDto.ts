import { IsDefined, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { BinaryEncoding } from '../signature/BinaryEncoding';
import { JsonCanonicalizationMethod } from '../signature/JsonCanonicalizationMethod';

/**
 * Request DTO for requesting a wallet to sign a binary message.
 * The wallet will sign the provided message using its private key and return the signature.
 */
export class WalletJsonSignatureVerificationRequestDto {

	@ApiProperty({
		description: 'The JSON object to verify. Will be canonicalized before verification using the selected canonicalization method',
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
		description: 'The signature to verify, encoded according to signatureEncoding',
		example: '69e2b51782654fb8874a6fee15b1c12d144bb511152dda57a699d58c2c3d2d375d4654ef1ccdc0d1bbc178575f15d46841c1ff6b7e8588c0b4de257cffc29efa',
	})
	@IsString()
	@IsNotEmpty()
	signature: string;

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