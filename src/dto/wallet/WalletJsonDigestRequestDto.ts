import { IsEnum, IsNotEmpty, IsOptional, IsString, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JsonObject } from '@cmts-dev/carmentis-sdk-core';

import { BinaryEncoding } from '../signature/BinaryEncoding';

/**
 * Request DTO for requesting a wallet to sign a binary message.
 * The wallet will sign the provided message using its private key and return the signature.
 */
export class WalletJsonDigestRequestDto {

	@ApiProperty({
		description: 'The binary message to be signed, encoded according to messageEncoding',
		example: '{ firstname: "John", lastname: "Doe" }'
	})
	@IsObject()
	object: JsonObject;

	@ApiProperty({
		description: 'Tells whether a salt must be automatically added',
	})
	@IsBoolean()
	addSalt: boolean;

	@ApiProperty({
		description: `The encoding method. Defaults to 'canonical'.`,
		default: 'canonical',
	})
	@IsString()
	encoding: string = 'canonical';

	@ApiProperty({
		description: `The digest algorithm. Defaults to 'sha256'.`,
		default: 'sha256',
	})
	@IsString()
	digestAlg: string = 'sha256';
}