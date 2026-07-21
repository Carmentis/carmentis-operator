import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CryptoEncoderFactory } from '@cmts-dev/carmentis-sdk-core';
import { match, P } from 'ts-pattern';
import { InvalidArgumentError } from 'commander';
import { canonicalize } from "json-canonicalize";
import { BinaryEncodingUtils } from '../../../utils/BinaryEncodingUtils';
import { BinaryMessageSignatureVerificationRequestDto } from '../../../dto/signature/BinaryMessageSignatureVerificationRequestDto';
import { JsonMessageSignatureVerificationRequestDto } from '../../../dto/signature/JsonMessageSignatureVerificationRequestDto';
import { JsonCanonicalizationMethod } from '../../../dto/signature/JsonCanonicalizationMethod';
import { BinaryEncoding } from '../../../dto/signature/BinaryEncoding';

@ApiTags('Crypto Signature')
@Controller('/api/crypto/signature')
export class CryptoSignatureController {

	@ApiOperation({
		summary: 'Verify a binary message signature',
		description: 'Verifies the authenticity of a signature for a binary message using a public key.'
	})
	@ApiResponse({
		status: 200,
		description: 'The signature has been verified.',
		schema: {
			properties: {
				verified: { type: 'boolean' }
			}
		}
	})
	@Post('verify/binary')
	async verifyBinarySignature(
		@Body() params: BinaryMessageSignatureVerificationRequestDto
	) {
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		const publicKey = await encoder.decodePublicKey(params.publicKey);
		const message = BinaryEncodingUtils.decode(params.message, params.messageEncoding);
		const encodedSignature = params.signature;
		const signature = BinaryEncodingUtils.decode(encodedSignature, params.signatureEncoding);
		const result =  await publicKey.verify(message, signature);
		return { verified: result }
	}

	@ApiOperation({
		summary: 'Verify a JSON message signature',
		description: 'Verifies the authenticity of a signature for a JSON message using a public key with canonical JSON encoding.'
	})
	@ApiResponse({
		status: 200,
		description: 'The signature has been verified.',
		schema: {
			properties: {
				verified: { type: 'boolean' }
			}
		}
	})
	@Post('verify/json')
	async verifyJsonSignature(
		@Body() params: JsonMessageSignatureVerificationRequestDto
	) {
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		const publicKey = await encoder.decodePublicKey(params.publicKey);
		const jsonObject=  params.message;
		const message = match(params.canonicalizationMethod)
			.with(JsonCanonicalizationMethod.JSON_CANONICAL, () => {
				const utf8Decoder = new TextEncoder();
				const rawPayload = utf8Decoder.encode(canonicalize(jsonObject));
				return rawPayload;
			})
			.exhaustive();


		const signature = BinaryEncodingUtils.decode(params.signature, params.signatureEncoding);
		const result = await publicKey.verify(message, signature);
		return { verified: result }
	}
}