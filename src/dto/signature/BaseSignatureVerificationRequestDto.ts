import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { BinaryEncoding } from './BinaryEncoding';

/**
 * Base class for all signature verification requests.
 * Contains common properties required for verifying cryptographic signatures.
 */
export abstract class BaseSignatureVerificationRequestDto {
	@ApiProperty({
		description: 'The signature to verify, encoded according to signatureEncoding',
		example: '69e2b51782654fb8874a6fee15b1c12d144bb511152dda57a699d58c2c3d2d375d4654ef1ccdc0d1bbc178575f15d46841c1ff6b7e8588c0b4de257cffc29efa',
	})
	@IsString()
	@IsNotEmpty()
	signature: string;

	@ApiProperty({
		description: 'The public key used to verify the signature.',
		example: 'sig:secp256k1:pk:03b48b07f147cbb5c2f33b188aee92434024cd30ba06147349bf8955f5aab3c537',
	})
	@IsString()
	@IsNotEmpty()
	publicKey: string;

	@ApiProperty({
		description: 'Encoding format of the signature bytes',
		enum: BinaryEncoding,
		default: BinaryEncoding.HEX,
		required: false,
	})
	@IsOptional()
	@IsEnum(BinaryEncoding)
	signatureEncoding: BinaryEncoding = BinaryEncoding.HEX;
}