import { Body, Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WalletService } from '../../services/WalletService';
import { WalletEntity } from '../../entities/WalletEntity';
import { CryptoEncoderFactory, Hash, ProviderFactory, SeedEncoder, WalletCrypto } from '@cmts-dev/carmentis-sdk-core';
import { BinaryEncodingUtils } from '../../utils/BinaryEncodingUtils';
import { WalletBinarySignatureRequestDto } from '../../dto/wallet/WalletBinarySignatureRequestDto';
import { WalletBinarySignatureVerificationRequestDto } from '../../dto/wallet/WalletBinarySignatureVerificationRequestDto';
import { ActorPublicKeyRequestDto } from '../../dto/wallet/ActorPublicKeyRequestDto';
import { WalletUtils } from '../../utils/WalletUtils';
import { VbUtils } from '../../utils/VbUtils';

@ApiTags('Wallet Crypto')
@Controller('/api/crypto/wallet')
export class WalletCryptoController {
	constructor(public service: WalletService) {}

	@ApiOperation({
		summary: 'Sign a binary message with wallet signature key',
		description: 'Signs a binary message using the wallet\'s private signature key.'
	})
	@ApiResponse({
		status: 200,
		description: 'The message has been signed.',
		schema: {
			properties: {
				signature: { type: 'string' }
			}
		}
	})
	@Get(':walletId/signature/sign')
	async sign(
		@Param('walletId') walletId: number,
		@Body() params: WalletBinarySignatureRequestDto,
	) {
		const wallet = await this.service.getOneById(walletId)
		if (!wallet) throw new NotFoundException('Wallet not found');
		const sk = await WalletUtils.getPrivateSignatureKeyFromWallet(wallet);
		const message = BinaryEncodingUtils.decode(params.message, params.messageEncoding);
		const rawSignature = await sk.sign(message);
		const signature = BinaryEncodingUtils.encode(rawSignature, params.signatureEncoding);
		return { signature: signature };
	}

	@ApiOperation({
		summary: 'Verify a binary message signature',
		description: 'Verifies that a signature was created by the wallet\'s private signature key.'
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
	@Get(':walletId/signature/verify')
	async verify(
		@Param('walletId') walletId: number,
		@Body() params: WalletBinarySignatureVerificationRequestDto,
	) {
		const wallet = await this.service.findOneBy({ id: walletId })
		if (!wallet) throw new NotFoundException('Wallet not found');
		const sk = await WalletUtils.getPrivateSignatureKeyFromWallet(wallet);
		const pk = await sk.getPublicKey();
		const message = BinaryEncodingUtils.decode(params.message, params.messageEncoding);
		const encodedSignature = params.signature;
		const signature = BinaryEncodingUtils.decode(encodedSignature, params.signatureEncoding);
		const result = await pk.verify(message, signature);
		return { verified: result }
	}

	@ApiOperation({
		summary: 'Get wallet public signature key',
		description: 'Retrieves the public signature key associated with the wallet.'
	})
	@ApiResponse({
		status: 200,
		description: 'The public signature key has been retrieved.',
		schema: {
			properties: {
				signature: {
					properties: {
						pk: { type: 'string' }
					}
				}
			}
		}
	})
	@Get(':walletId/signature/pk')
	async getPublicSignatureKey(
		@Param('walletId') walletId: number,
	) {
		const wallet = await this.service.getOneById(walletId)
		if (!wallet) throw new NotFoundException('Wallet not found');
		const sk = await WalletUtils.getPrivateSignatureKeyFromWallet(wallet);
		const pk = await sk.getPublicKey();
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		return { signature: { pk: await encoder.encodePublicKey(pk) } }
	}

	@ApiOperation({
		summary: 'Get wallet public encryption key',
		description: 'Retrieves the public encryption key associated with the wallet.'
	})
	@ApiResponse({
		status: 200,
		description: 'The public encryption key has been retrieved.',
		schema: {
			properties: {
				pke: {
					properties: {
						pk: { type: 'string' }
					}
				}
			}
		}
	})
	@Get(':walletId/pke/pk')
	async getPublicEncryptionKey(
		@Param('walletId') walletId: number
	) {
		const wallet = await this.service.getOneById(walletId)
		if (!wallet) throw new NotFoundException('Wallet not found');
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
		status: 200,
		description: 'The actor\'s public signature key has been retrieved.',
		schema: {
			properties: {
				signature: {
					properties: {
						pk: { type: 'string' }
					}
				}
			}
		}
	})
	@Get(':walletId/actor/signature/pk')
	async getActorPublicSignatureKey(
		@Param('walletId') walletId: number,
		@Body() params: ActorPublicKeyRequestDto
	) {
		const wallet = await this.service.getOneById(walletId)
		if (!wallet) throw new NotFoundException('Wallet not found');
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
		status: 200,
		description: 'The actor\'s public encryption key has been retrieved.',
		schema: {
			properties: {
				pke: {
					properties: {
						pk: { type: 'string' }
					}
				}
			}
		}
	})
	@Get(':walletId/actor/pke/pk')
	async getActorPublicEncryptionKey(
		@Param('walletId') walletId: number,
		@Body() params: ActorPublicKeyRequestDto
	) {
		const wallet = await this.service.getOneById(walletId)
		if (!wallet) throw new NotFoundException('Wallet not found');
		const vbId = BinaryEncodingUtils.decode(params.vbId, params.vbIdEncoding);
		const vbSeed = await VbUtils.getVbSeedFromVbId(wallet, vbId)
		const sk = await WalletUtils.getActorPrivateDecryptionKeyFromWallet(wallet, vbSeed);
		const pk = await sk.getPublicKey();
		const encoder = CryptoEncoderFactory.defaultStringPublicKeyEncryptionEncoder();
		return { pke: { pk: await encoder.encodePublicEncryptionKey(pk) } }
	}


}