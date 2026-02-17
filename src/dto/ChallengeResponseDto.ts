import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for challenge generation endpoint
 */
export class ChallengeResponseDto {
	@ApiProperty({ description: 'The generated challenge string', example: '3f4a8b2c1d...' })
	challenge: string;

	@ApiProperty({ description: 'Message Authentication Code (MAC) tag for challenge verification', example: 'a7f3c9d2e1...' })
	mac: string;

	@ApiProperty({ description: 'Timestamp when the challenge expires (ISO 8601)', example: '2026-02-17T14:30:00.000Z' })
	expiresAt: string;
}
