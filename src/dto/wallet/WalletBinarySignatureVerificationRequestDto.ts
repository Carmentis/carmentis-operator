import { BinaryMessageSignatureVerificationRequestDto } from '../signature/BinaryMessageSignatureVerificationRequestDto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BinaryEncoding } from '../signature/BinaryEncoding';

export class WalletBinarySignatureVerificationRequestDto {
	@ApiProperty({
		description: 'The signature to verify, encoded according to signatureEncoding',
		example: '69e2b51782654fb8874a6fee15b1c12d144bb511152dda57a699d58c2c3d2d375d4654ef1ccdc0d1bbc178575f15d46841c1ff6b7e8588c0b4de257cffc29efa',
	})
	@IsString()
	@IsNotEmpty()
	signature: string;

	@ApiProperty({
		description: 'Encoding format of the signature bytes',
		enum: BinaryEncoding,
		default: BinaryEncoding.HEX,
		required: false,
	})
	@IsOptional()
	@IsEnum(BinaryEncoding)
	signatureEncoding: BinaryEncoding = BinaryEncoding.HEX;

	@ApiProperty({
		description: 'The message to verify, encoded according to messageEncoding',
		example: '123456789a',
	})
	@IsString()
	@IsNotEmpty()
	message: string;

	@ApiProperty({
		description: 'Encoding format of the message bytes',
		enum: BinaryEncoding,
		default: BinaryEncoding.HEX,
		required: false,
	})
	@IsOptional()
	@IsEnum(BinaryEncoding)
	messageEncoding: BinaryEncoding = BinaryEncoding.HEX;
}