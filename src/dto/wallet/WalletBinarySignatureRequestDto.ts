import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BinaryEncoding } from '../signature/SignatureVerificationRequestDto';

export class WalletBinarySignatureRequestDto {

	/**
	 * The message to be signed.
	 */
	@IsString()
	@IsNotEmpty()
	message: string;

	/**
	 * Indicates the used encoding of the received message.
	 */
	@IsOptional()
	@IsEnum(BinaryEncoding)
	messageEncoding: BinaryEncoding = BinaryEncoding.HEX;

	/**
	 * Indicates the desired encoding of the signature.
	 */
	@IsOptional()
	@IsEnum(BinaryEncoding)
	signatureEncoding: BinaryEncoding = BinaryEncoding.HEX;
}