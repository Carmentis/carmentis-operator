import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WalletService } from '../../services/WalletService';
import { WalletEntity } from '../../entities/WalletEntity';
import {
	CryptoEncoderFactory,
	Hash,
	PrivateSignatureKey,
	ProviderFactory, PublicSignatureKey,
	SeedEncoder,
	WalletCrypto,
} from '@cmts-dev/carmentis-sdk-core';
import { WalletBinarySignatureRequestDto } from '../../dto/wallet/WalletBinarySignatureRequestDto';
import { WalletBinarySignatureVerificationRequestDto } from '../../dto/wallet/WalletBinarySignatureVerificationRequestDto';
import { CryptoService } from '../../services/CryptoService';
import { SignatureVerificationApiResponse } from '../../swagger/SignatureVerificationApiResponse';
import { JsonSignatureRequestDto } from '../../dto/signature/JsonSignatureRequestDto';
import { JsonSignatureVerificationRequestDto } from '../../dto/signature/JsonSignatureVerificationRequestDto';
import { JsonSignatureService } from '../../services/JsonSignatureService';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';
import { ExtractPrivateSignatureKeyFromWallet } from '../../pipes/ExtractPrivateSignatureKeyFromWallet';
import { ExtractPublicSignatureKeyFromWallet } from '../../pipes/ExtractPublicSignatureKeyFromWallet';
import { PublicKeyRetrievalApiResponse } from '../../swagger/PublicKeyRetreivalApiResponse';
import { API_V1 } from '../../api/ApiVersion';

@ApiTags('Wallet Crypto')
@Controller({ path: 'crypto/wallet', version: API_V1 })
@ApiParam({ name: 'walletId', type: Number, description: 'Wallet identifier' })
export class WalletCryptoController {
	constructor(
		public service: WalletService,
		private cryptoService: CryptoService,
		private jsonSignatureService: JsonSignatureService,
	) {}

	@ApiOperation({
		summary: 'Sign a binary message with wallet signature key',
		description: 'Signs a binary message using the wallet\'s private signature key.'
	})
	@ApiParam({ name: 'walletId', type: Number, description: 'Wallet identifier' })
	@ApiResponse(SignatureVerificationApiResponse.Response200)
	@Post([
		':walletId/signature/sign',
		':walletId/signature/sign/binary'
	])
	async sign(
		@Param('walletId', WalletByIdPipe, ExtractPrivateSignatureKeyFromWallet)
		sk: PrivateSignatureKey,
		@Body() params: WalletBinarySignatureRequestDto,
	) {
		return this.cryptoService.signBinary(sk, params.message, params.messageEncoding, params.signatureEncoding);
	}

	@ApiOperation({
		summary: 'Sign a JSON payload with the wallet signature key',
		description:
			'Signs a JSON payload, bound to a context (purpose, target, validity window...), using the SDK JSON signatures. ' +
			'Supports `json-canonical+utf8` and `jws` (the latter requires a wallet backed by a JWK private key).'
	})
	@Post(':walletId/json-signature/sign')
	async signJsonSignature(
		@Param('walletId', WalletByIdPipe, ExtractPrivateSignatureKeyFromWallet)
		sk: PrivateSignatureKey,
		@Body() params: JsonSignatureRequestDto,
	) {
		return this.jsonSignatureService.sign(sk, params.signatureType, params.context, params.payload, params.options);
	}

	@ApiOperation({
		summary: "Verify a binary message signature with the wallet's public key"
	})
	@ApiResponse(SignatureVerificationApiResponse.Response200)
	@Post([
		':walletId/signature/verify',
		':walletId/signature/verify/binary'
	])
	async verify(
		@Param('walletId', WalletByIdPipe, ExtractPublicSignatureKeyFromWallet)
		pk: PublicSignatureKey,
		@Body() params: WalletBinarySignatureVerificationRequestDto,
	) {
		return this.cryptoService.verifyBinary(pk, params.message, params.messageEncoding, params.signature, params.signatureEncoding);
	}

	@ApiOperation({
		summary: "Verify a JSON signature with the wallet's public key",
		description: 'Verifies a `json-canonical+utf8` or `jws` signature and the context it carries.'
	})
	@Post(':walletId/json-signature/verify')
	async verifyJsonSignature(
		@Param('walletId', WalletByIdPipe, ExtractPublicSignatureKeyFromWallet)
		pk: PublicSignatureKey,
		@Body() params: JsonSignatureVerificationRequestDto,
	) {
		return this.jsonSignatureService.verify(pk, params.signature, params.payload, params.verificationContext);
	}

	@ApiOperation({
		summary: 'Get wallet public signature key',
		description: 'Retrieves the public signature key associated with the wallet.'
	})
	@ApiResponse(PublicKeyRetrievalApiResponse.Signature.Response200)
	@Get(':walletId/signature/pk')
	async getPublicSignatureKey(
		@Param('walletId', WalletByIdPipe, ExtractPublicSignatureKeyFromWallet)
		pk: PublicSignatureKey
	) {
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		return { signature: { pk: await encoder.encodePublicKey(pk) } }
	}

	/*
	@ApiOperation({
		summary: 'Get actor public signature key',
		description: 'Retrieves the public signature key for an actor in a virtual blockchain associated with the wallet.'
	})
	@ApiResponse({
		...PublicKeyRetrievalApiResponse.Signature.Response200,
		description: 'The actor\'s public signature key'
	})
	@Get(':walletId/actor/signature/pk')
	async getActorPublicSignatureKey(
		@Param('walletId', WalletByIdPipe) wallet: WalletEntity,
		@Query() params: ActorPublicKeyRequestDto
	) {
		const vbId = BinaryEncodingUtils.decode(params.vbId, params.vbIdEncoding);
		const vbSeed = await VbUtils.getVbSeedFromVbId(wallet, vbId)
		const sk = await WalletUtils.getActorPrivateSignatureKeyFromWallet(wallet, vbSeed);
		const pk = await sk.getPublicKey();
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		return { signature: { pk: await encoder.encodePublicKey(pk) } }
	}

	@ApiOperation({
		summary: 'Get actor public encryption key',
		description: 'Retrieves the public encryption key for an actor in a virtual blockchain associated with the wallet.'
	})
	@ApiResponse({
		...PublicKeyRetrievalApiResponse.Pke.Response200,
		description: 'The actor\'s public encryption key.'
	})
	@Get(':walletId/actor/pke/pk')
	async getActorPublicEncryptionKey(
		@Param('walletId', WalletByIdPipe) wallet: WalletEntity,
		@Query() params: ActorPublicKeyRequestDto
	) {
		const vbId = BinaryEncodingUtils.decode(params.vbId, params.vbIdEncoding);
		const vbSeed = await VbUtils.getVbSeedFromVbId(wallet, vbId)
		const sk = await WalletUtils.getActorPrivateDecryptionKeyFromWallet(wallet, vbSeed);
		const pk = await sk.getPublicKey();
		const encoder = CryptoEncoderFactory.defaultStringPublicKeyEncryptionEncoder();
		return { pke: { pk: await encoder.encodePublicEncryptionKey(pk) } }
	}

	 */


}