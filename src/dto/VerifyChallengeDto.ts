import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Request DTO for challenge verification endpoint
 */
export class VerifyChallengeDto {
	@ApiProperty({ description: 'The challenge string received from login endpoint', example: '3f4a8b2c1d...' })
	challenge: string;

	@IsString()
	@ApiProperty({ description: 'Public key of the user attempting to authenticate', example: '0x1234abcd...' })
	publicKey: string;

	@ApiProperty({ description: 'Signature of the challenge signed with the user private key', example: 'a2b3c4d5e6...' })
	signature: string;

	@ApiProperty({ description: 'MAC tag received from login endpoint for challenge authenticity verification', example: 'a7f3c9d2e1...' })
	mac: string;

	@ApiProperty({ description: 'Expiration timestamp received from login endpoint (ISO 8601)', example: '2026-02-17T14:30:00.000Z' })
	expiresAt: string;
}
