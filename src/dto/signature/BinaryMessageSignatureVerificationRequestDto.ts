import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseSignatureVerificationRequestDto } from './BaseSignatureVerificationRequestDto';
import { BinaryEncoding } from './BinaryEncoding';

/**
 * Request DTO for verifying signatures over binary messages.
 * The message is provided as an encoded string (hex/base64) and is verified directly
 * without any transformation.
 *
 * @example
 * {
 *   "signature": "3045022100e8af1ba0...",
 *   "publicKey": "04a1b2c3d4e5f6a7...",
 *   "message": "48656c6c6f20576f726c64",
 *   "messageEncoding": "hex",
 *   "signatureEncoding": "hex"
 * }
 */
export class BinaryMessageSignatureVerificationRequestDto extends BaseSignatureVerificationRequestDto {
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