import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import crypto from 'crypto';

@ApiTags('Crypto')
@Controller('/api/crypto')
export class CryptoController {
	/**
	 * Generate a cryptographic challenge
	 */
	@ApiOperation({
		summary: 'Generate a cryptographic challenge',
		description: 'Generates a random challenge string for authentication purposes.'
	})
	@ApiResponse({
		status: 200,
		description: 'A new challenge has been generated.',
		schema: {
			properties: {
				challenge: { type: 'string', example: 'dGVzdC1jaGFsbGVuZ2U=' }
			}
		}
	})
	@ApiQuery({
		name: 'length',
		description: 'The length of the challenge string in bytes.',
		required: false,
		type: Number,
		default: 32
	})
	@Get('/challenge')
	async generateChallenge(
		@Query('length', ParseIntPipe)
		length: number = 32
	) {
		const challenge = crypto.randomBytes(length).toString('base64url');
		return { challenge }
	}


	/**
	 * Generate a cryptographic nonce
	 */
	@ApiOperation({
		summary: 'Generate a cryptographic nonce',
		description: 'Generates a random nonce for use in cryptographic operations.'
	})
	@ApiResponse({
		status: 200,
		description: 'A new nonce has been generated.',
		schema: {
			properties: {
				nonce: { type: 'string', example: 'dGVzdC1ub25jZQ==' }
			}
		}
	})
	@Get('/nonce')
	async generateNonce() {
		const nonce = crypto.randomBytes(16).toString('base64url');
		return { nonce }
	}


	/**
	 * Generate a UUID
	 */
	@ApiOperation({
		summary: 'Generate a UUID',
		description: 'Generates a random universally unique identifier.'
	})
	@ApiResponse({
		status: 200,
		description: 'A new UUID has been generated.',
		schema: {
			properties: {
				uuid: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' }
			}
		}
	})
	@Get('/uuid')
	async generateUuid() {
		return { uuid: crypto.randomUUID() }
	}
}