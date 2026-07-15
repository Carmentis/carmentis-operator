import { Body, Controller, Post } from '@nestjs/common';
import {
	BinaryEncoding,
	BinaryMessageSignatureVerificationDto, JsonCanonicalizationMethod,
	JsonMessageSignatureVerificationDto,
} from '../../../dto/signature/SignatureVerificationRequestDto';
import { CryptoEncoderFactory } from '@cmts-dev/carmentis-sdk-core';
import { match, P } from 'ts-pattern';
import { InvalidArgumentError } from 'commander';
import { canonicalize } from "json-canonicalize";
import { BinaryEncodingUtils } from '../../../utils/BinaryEncodingUtils';

@Controller('/api/crypto/signature')
export class SignatureController {

	@Post('verify')
	@Post('verify/binary')
	async verifyBinarySignature(
		@Body() params: BinaryMessageSignatureVerificationDto
	) {
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		const publicKey = await encoder.decodePublicKey(params.publicKey);
		const message = BinaryEncodingUtils.decode(params.message, params.messageEncoding);
		const encodedSignature = params.signature;
		const signature = BinaryEncodingUtils.decode(encodedSignature, params.signatureEncoding);
		const result =  await publicKey.verify(message, signature);
		return { verified: result }
	}

	@Post('verify/json')
	async verifyJsonSignature(
		@Body() params: JsonMessageSignatureVerificationDto
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