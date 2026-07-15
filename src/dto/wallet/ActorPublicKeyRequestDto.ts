import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BinaryEncoding } from '../signature/SignatureVerificationRequestDto';

/**
 * Allows to ask an actor request public key.
 */
export class ActorPublicKeyRequestDto {
	@IsString()
	@IsNotEmpty()
	vbId: string;

	/**
	 * Indicates the used encoding of the received message.
	 */
	@IsEnum(BinaryEncoding)
	vbIdEncoding: BinaryEncoding = BinaryEncoding.HEX;
}