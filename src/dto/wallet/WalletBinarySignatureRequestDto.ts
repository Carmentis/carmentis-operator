import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { BinaryEncoding } from '../signature/BinaryEncoding';

/**
 * Request DTO for requesting a wallet to sign a binary message.
 * The wallet will sign the provided message using its private key and return the signature.
 */
export class WalletBinarySignatureRequestDto {

	@ApiProperty({
		description: 'The binary message to be signed, encoded according to messageEncoding',
		example: '48656c6c6f20576f726c64'
	})
	@IsString()
	@IsNotEmpty()
	message: string;

	@ApiProperty({
		description: 'Encoding format of the input message',
		enum: BinaryEncoding,
		default: BinaryEncoding.HEX,
		required: false
	})
	@IsOptional()
	@IsEnum(BinaryEncoding)
	messageEncoding: BinaryEncoding = BinaryEncoding.HEX;

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