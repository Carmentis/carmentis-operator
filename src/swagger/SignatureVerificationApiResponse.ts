import { ApiResponseOptions } from '@nestjs/swagger';


/**
 * Signature verification documentation response
 */
export class SignatureVerificationApiResponse {
	static Response200: ApiResponseOptions = {
		status: 200,
		description: 'Signature verification result.',
		schema: {
			properties: {
				verified: { type: 'boolean' },
			},
		},
	};
}