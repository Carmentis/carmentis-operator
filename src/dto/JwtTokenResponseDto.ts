import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for successful challenge verification
 */
export class JwtTokenResponseDto {
	@ApiProperty({ description: 'JWT token for authenticated session', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
	token: string;

	@ApiProperty({ description: 'Token expiration timestamp (ISO 8601)', example: '2026-02-17T22:30:00.000Z' })
	expiresAt: string;
}
