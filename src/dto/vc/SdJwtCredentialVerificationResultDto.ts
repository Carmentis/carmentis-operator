import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO containing the result of a credential verification operation.
 * Includes success status and any errors encountered during verification.
 * Optional fields may be included if verification partially succeeds.
 */
export class SdJwtCredentialVerificationResultDto {
	@ApiProperty({
		description: 'Indicates whether the credential verification succeeded',
		example: true,
		type: Boolean,
	})
	success: boolean;

	@ApiProperty({
		description: 'List of error messages encountered during verification. Empty if success is true',
		example: ['Signature verification failed', 'Issuer is not trusted'],
		type: [String],
	})
	errors: string[];

	@ApiPropertyOptional({
		description: 'Array of error codes corresponding to the errors. Only populated if errors occurred',
		example: ['SIGNATURE_VERIFICATION_FAILED', 'UNTRUSTED_ISSUER'],
		type: [String],
	})
	errorCodes?: string[];

	@ApiPropertyOptional({
		description: 'The parsed credential structure. Only populated if credential parsing succeeded, even if other verification checks failed',
		example: {
			iss: 'did:web:issuer.example.com',
			sub: 'did:key:z6MkhaXgBZDvotDkL5257faWxcqDy2Kwp5l0EQ3SL7AEm57D',
			vc: {
				'@context': ['https://www.w3.org/2018/credentials/v1'],
				type: ['VerifiableCredential'],
				credentialSubject: {
					name: 'John Doe',
					email: 'john@example.com'
				}
			}
		},
		type: Object,
	})
	parsedCredential?: Record<string, any>;

	@ApiPropertyOptional({
		description: 'The disclosed claims from the credential. Only populated if the credential was successfully parsed and claims were extracted',
		example: {
			name: 'John Doe',
			email: 'john@example.com',
			address: {
				street: '123 Main St',
				city: 'Springfield'
			}
		},
		type: Object,
	})
	claims?: Record<string, any>;
}
