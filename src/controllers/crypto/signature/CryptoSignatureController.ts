import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CryptoEncoderFactory } from '@cmts-dev/carmentis-sdk-core';
import { BinaryEncodingUtils } from '../../../utils/BinaryEncodingUtils';
import {
	BinaryMessageSignatureVerificationRequestDto,
} from '../../../dto/signature/BinaryMessageSignatureVerificationRequestDto';
import { JsonSignatureVerificationWithPublicKeyRequestDto } from '../../../dto/signature/JsonSignatureVerificationRequestDto';
import { JsonSignatureService } from '../../../services/JsonSignatureService';
import { CryptoService } from '../../../services/CryptoService';
import { SignatureVerificationApiResponse } from '../../../swagger/SignatureVerificationApiResponse';
import { API_V1 } from '../../../api/ApiVersion';

@ApiTags('Crypto Signature')
@Controller({ path: 'crypto/signature', version: API_V1 })
export class CryptoSignatureController {

	constructor(
		private readonly cryptoService: CryptoService,
		private readonly jsonSignatureService: JsonSignatureService,
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
		summary: 'Verify a JSON signature',
		description: 'Verifies a `json-canonical+utf8` or `jws` signature, and the context it carries, with a public key.'
	})
	@Post('json-signature/verify')
	async verifyJsonSignature(
		@Body() params: JsonSignatureVerificationWithPublicKeyRequestDto
	) {
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		const publicKey = await encoder.decodePublicKey(params.publicKey);
		return this.jsonSignatureService.verify(publicKey, params.signature, params.payload, params.verificationContext);
	}
}