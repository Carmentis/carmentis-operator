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
import { BinaryEncodingUtils } from '../../utils/BinaryEncodingUtils';
import { WalletBinarySignatureRequestDto } from '../../dto/wallet/WalletBinarySignatureRequestDto';
import { WalletBinarySignatureVerificationRequestDto } from '../../dto/wallet/WalletBinarySignatureVerificationRequestDto';
import { ActorPublicKeyRequestDto } from '../../dto/wallet/ActorPublicKeyRequestDto';
import { WalletUtils } from '../../utils/WalletUtils';
import { VbUtils } from '../../utils/VbUtils';
import { CryptoService } from '../../services/CryptoService';
import { SignatureVerificationApiResponse } from '../../swagger/SignatureVerificationApiResponse';
import { WalletJsonSignatureRequestDto } from '../../dto/wallet/WalletJsonSignatureRequestDto';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';
import { ExtractPrivateSignatureKeyFromWallet } from '../../pipes/ExtractPrivateSignatureKeyFromWallet';
import { ExtractPublicSignatureKeyFromWallet } from '../../pipes/ExtractPublicSignatureKeyFromWallet';
import { PublicKeyRetrievalApiResponse } from '../../swagger/PublicKeyRetreivalApiResponse';
import { WalletJsonSignatureVerificationRequestDto } from '../../dto/wallet/WalletJsonSignatureVerificationRequestDto';

@ApiTags('Wallet Crypto')
@Controller('/api/crypto/wallet')
@ApiParam({ name: 'walletId', type: Number, description: 'Wallet identifier' })
export class WalletCryptoController {
	constructor(
		public service: WalletService,
		private cryptoService: CryptoService,
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
		summary: 'Sign a json message with wallet signature key',
	})
	@ApiResponse(SignatureVerificationApiResponse.Response200)
	@Post(':walletId/signature/sign/json')
	async signJson(
		@Param('walletId', WalletByIdPipe, ExtractPrivateSignatureKeyFromWallet)
		sk: PrivateSignatureKey,
		@Body() params: WalletJsonSignatureRequestDto,
	) {
		return this.cryptoService.signJson(sk, params.message, params.canonicalizationMethod, params.signatureEncoding);
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
		summary: "Verify a json message signature with the wallet's public key"
	})
	@ApiResponse(SignatureVerificationApiResponse.Response200)
	@Post(':walletId/signature/verify/json')
	async verifyJson(
		@Param('walletId', WalletByIdPipe, ExtractPublicSignatureKeyFromWallet)
		pk: PublicSignatureKey,
		@Body() params: WalletJsonSignatureVerificationRequestDto,
	) {
		return this.cryptoService.verifyJson(pk, params.message, params.canonicalizationMethod, params.signature, params.signatureEncoding);
	}

	@ApiOperation({
		summary: 'Get wallet public signature key',
		description: 'Retrieves the public signature key associated with the wallet.'
	})
	@ApiResponse(PublicKeyRetrievalApiResponse.Signature.Response200)
	@Get(':walletId/signature/pk')
	async getPublicSignatureKey(
		@Param('walletId', WalletByIdPipe) wallet: WalletEntity,
	) {
		const sk = await WalletUtils.getPrivateSignatureKeyFromWallet(wallet);
		const pk = await sk.getPublicKey();
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		return { signature: { pk: await encoder.encodePublicKey(pk) } }
	}

	@ApiOperation({
		summary: 'Get wallet public encryption key',
		description: 'Retrieves the public encryption key associated with the wallet.'
	})
	@ApiResponse(PublicKeyRetrievalApiResponse.Pke.Response200)
	@Get(':walletId/pke/pk')
	async getPublicEncryptionKey(
		@Param('walletId', WalletByIdPipe) wallet: WalletEntity,
	) {
		const sk = await WalletUtils.getPrivateDecryptionKeyFromWallet(wallet);
		const pk = await sk.getPublicKey();
		const encoder = CryptoEncoderFactory.defaultStringPublicKeyEncryptionEncoder();
		return { pke: { pk: await encoder.encodePublicEncryptionKey(pk) } }
	}

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


}