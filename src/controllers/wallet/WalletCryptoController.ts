import { Body, Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { WalletService } from '../../services/WalletService';
import { WalletEntity } from '../../entities/WalletEntity';
import { CryptoEncoderFactory, Hash, ProviderFactory, SeedEncoder, WalletCrypto } from '@cmts-dev/carmentis-sdk-core';
import { BinaryEncodingUtils } from '../../utils/BinaryEncodingUtils';
import { WalletBinarySignatureRequestDto } from '../../dto/wallet/WalletBinarySignatureRequestDto';
import { WalletBinarySignatureVerificationRequestDto } from '../../dto/wallet/WalletBinarySignatureVerificationRequestDto';
import { ActorPublicKeyRequestDto } from '../../dto/wallet/ActorPublicKeyRequestDto';
import { WalletUtils } from '../../utils/WalletUtils';
import { VbUtils } from '../../utils/VbUtils';

@Controller('/api/crypto/wallet')
export class WalletCryptoController {
	constructor(public service: WalletService) {}

	@Get(':walletId/signature/sign')
	async sign(
		@Param('walletId') walletId: number,
		@Body() params: WalletBinarySignatureRequestDto,
	) {
		const wallet = await this.service.findOneBy({ walletId })
		if (!wallet) throw new NotFoundException('Wallet not found');
		const sk = await WalletUtils.getPrivateSignatureKeyFromWallet(wallet);
		const message = BinaryEncodingUtils.decode(params.message, params.messageEncoding);
		const rawSignature = await sk.sign(message);
		const signature = BinaryEncodingUtils.encode(rawSignature, params.signatureEncoding);
		return { signature: signature };
	}

	@Get(':walletId/signature/verify')
	async verify(
		@Param('walletId') walletId: number,
		@Body() params: WalletBinarySignatureVerificationRequestDto,
	) {
		const wallet = await this.service.findOneBy({ walletId })
		if (!wallet) throw new NotFoundException('Wallet not found');
		const sk = await WalletUtils.getPrivateSignatureKeyFromWallet(wallet);
		const pk = await sk.getPublicKey();
		const message = BinaryEncodingUtils.decode(params.message, params.messageEncoding);
		const encodedSignature = params.signature;
		const signature = BinaryEncodingUtils.decode(encodedSignature, params.signatureEncoding);
		const result = await pk.verify(message, signature);
		return { verified: result }
	}



	@Get(':walletId/signature/pk')
	async getPublicSignatureKey(
		@Param('walletId') walletId: number,
	) {
		const wallet = await this.service.findOneBy({ walletId })
		if (!wallet) throw new NotFoundException('Wallet not found');
		const sk = await WalletUtils.getPrivateSignatureKeyFromWallet(wallet);
		const pk = await sk.getPublicKey();
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		return { signature: { pk: await encoder.encodePublicKey(pk) } }
	}

	@Get(':walletId/pke/pk')
	async getPublicEncryptionKey(
		@Param('walletId') walletId: number
	) {
		const wallet = await this.service.findOneBy({ walletId })
		if (!wallet) throw new NotFoundException('Wallet not found');
		const sk = await WalletUtils.getPrivateDecryptionKeyFromWallet(wallet);
		const pk = await sk.getPublicKey();
		const encoder = CryptoEncoderFactory.defaultStringPublicKeyEncryptionEncoder();
		return { pke: { pk: await encoder.encodePublicEncryptionKey(pk) } }
	}

	@Get(':walletId/actor/signature/pk')
	async getActorPublicSignatureKey(
		@Param('walletId') walletId: number,
		@Body() params: ActorPublicKeyRequestDto
	) {
		const wallet = await this.service.findOneBy({ walletId })
		if (!wallet) throw new NotFoundException('Wallet not found');
		const vbId = BinaryEncodingUtils.decode(params.vbId, params.vbIdEncoding);
		const vbSeed = await VbUtils.getVbSeedFromVbId(wallet, vbId)
		const sk = await WalletUtils.getActorPrivateSignatureKeyFromWallet(wallet, vbSeed);
		const pk = await sk.getPublicKey();
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		return { signature: { pk: await encoder.encodePublicKey(pk) } }
	}

	@Get(':walletId/actor/pke/pk')
	async getActorPublicEncryptionKey(
		@Param('walletId') walletId: number,
		@Body() params: ActorPublicKeyRequestDto
	) {
		const wallet = await this.service.findOneBy({ walletId })
		if (!wallet) throw new NotFoundException('Wallet not found');
		const vbId = BinaryEncodingUtils.decode(params.vbId, params.vbIdEncoding);
		const vbSeed = await VbUtils.getVbSeedFromVbId(wallet, vbId)
		const sk = await WalletUtils.getActorPrivateDecryptionKeyFromWallet(wallet, vbSeed);
		const pk = await sk.getPublicKey();
		const encoder = CryptoEncoderFactory.defaultStringPublicKeyEncryptionEncoder();
		return { pke: { pk: await encoder.encodePublicEncryptionKey(pk) } }
	}


}