import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO containing the result of a credential verification operation.
 * Includes success status and any errors encountered during verification.
 */
export class CredentialVerificationResultDto {
	/** Whether the credential verification was successful. True if all checks passed, false otherwise */
	@ApiProperty({
		description: 'Indicates whether the credential verification succeeded',
		example: true,
	})
	success: boolean;

	/** Array of error messages if verification failed. Empty if successful */
	@ApiProperty({
		description: 'List of error messages encountered during verification. Empty if success is true',
		example: ['Signature verification failed', 'Issuer is not trusted'],
		type: [String],
	})
	errors: string[];
}
