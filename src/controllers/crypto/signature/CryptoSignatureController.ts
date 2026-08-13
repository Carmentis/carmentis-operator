import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CryptoEncoderFactory } from '@cmts-dev/carmentis-sdk-core';
import { match } from 'ts-pattern';
import { canonicalize } from 'json-canonicalize';
import { BinaryEncodingUtils } from '../../../utils/BinaryEncodingUtils';
import {
	BinaryMessageSignatureVerificationRequestDto,
} from '../../../dto/signature/BinaryMessageSignatureVerificationRequestDto';
import {
	JsonMessageSignatureVerificationRequestDto,
} from '../../../dto/signature/JsonMessageSignatureVerificationRequestDto';
import { JsonCanonicalizationMethod } from '../../../dto/signature/JsonCanonicalizationMethod';
import { CryptoService } from '../../../services/CryptoService';
import { SignatureVerificationApiResponse } from '../../../swagger/SignatureVerificationApiResponse';

@ApiTags('Crypto Signature')
@Controller('/api/crypto/signature')
export class CryptoSignatureController {

	constructor(
		private readonly cryptoService: CryptoService
	) {}

	@ApiOperation({
		summary: 'Verify a binary message signature',
		description: 'Verifies the authenticity of a signature for a binary message using a public key.'
	})
	@ApiResponse(SignatureVerificationApiResponse.Response200)
	@Post([
		'verify',
		'verify/binary'
	])
	async verifyBinarySignature(
		@Body() params: BinaryMessageSignatureVerificationRequestDto
	) {
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		const publicKey = await encoder.decodePublicKey(params.publicKey);
		return this.cryptoService.verifyBinary(publicKey, params.message, params.messageEncoding, params.signature, params.signatureEncoding);
	}

	@ApiOperation({
		summary: 'Verify a JSON message signature',
		description: 'Verifies the authenticity of a signature for a JSON message using a public key with canonical JSON encoding.'
	})
	@ApiResponse(SignatureVerificationApiResponse.Response200)
	@Post('verify/json')
	async verifyJsonSignature(
		@Body() params: JsonMessageSignatureVerificationRequestDto
	) {
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		const publicKey = await encoder.decodePublicKey(params.publicKey);
		return this.cryptoService.verifyJson(
			publicKey,
			params.message,
			params.canonicalizationMethod,
			params.signature,
			params.signatureEncoding
		);
	}
}