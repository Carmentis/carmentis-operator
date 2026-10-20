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

	/**
	 * Result of a JSON signature verification (`json-canonical+utf8` or `jws`). The HTTP status
	 * is 200 whether or not the signature is valid: check the `verified` discriminator.
	 */
	static JsonResponse200: ApiResponseOptions = {
		status: 200,
		description:
			'JSON signature verification result, discriminated by `verified`. ' +
			'When `true`, the signature and its context are valid and the signed `context` and `payload` are returned. ' +
			'When `false`, `errors` explains why (e.g. `Invalid signature`, `Malformed signature`, `Not valid yet`, ' +
			'`Expired`, `Allowed on chain not match`).',
		examples: {
			verified: {
				summary: 'Valid signature',
				value: {
					verified: true,
					context: {
						signedAt: 1760000000000,
						purpose: 'document-approval',
						target: 'contract-42',
					},
					payload: { documentId: 'contract-42', approved: true },
				},
			},
			invalidSignature: {
				summary: 'Invalid signature',
				value: { verified: false, errors: ['Invalid signature'] },
			},
			expired: {
				summary: 'Signature outside its validity window',
				value: { verified: false, errors: ['Expired'] },
			},
		},
		schema: {
			oneOf: [
				{
					type: 'object',
					required: ['verified', 'context', 'payload'],
					properties: {
						verified: { type: 'boolean', enum: [true] },
						context: {
							type: 'object',
							description: 'Signature context that was signed together with the payload.',
							required: ['signedAt', 'purpose'],
							additionalProperties: true,
							properties: {
								signedAt: { type: 'number', description: 'Signing time (Unix timestamp in ms).' },
								purpose: { type: 'string' },
								target: { type: 'string' },
								requestedAt: { type: 'number' },
								notValidBefore: { type: 'number' },
								notValidAfter: { type: 'number' },
								allowOnChain: { type: 'boolean' },
								organizationId: { type: 'string' },
								applicationId: { type: 'string' },
								applicationLedgerId: { type: 'string' },
								applicationLedgerLatestMicroblockHash: { type: 'string' },
							},
						},
						payload: { description: 'The signed JSON payload (any JSON value).' },
					},
				},
				{
					type: 'object',
					required: ['verified', 'errors'],
					properties: {
						verified: { type: 'boolean', enum: [false] },
						errors: {
							type: 'array',
							items: { type: 'string' },
							example: ['Invalid signature'],
						},
					},
				},
			],
		},
	};
}
