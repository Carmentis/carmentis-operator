import { DataSource } from 'typeorm';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CryptoEncoderFactory, WalletCrypto } from '@cmts-dev/carmentis-sdk-core';
import { DeskAuthChallengeEntity } from '../entities/DeskAuthChallengeEntity';
import { DeskAuthChallengeService } from './DeskAuthChallengeService';
import { CarmentisDeskAuthService } from './CarmentisDeskAuthService';
import { encodeAuthChallengeRequest } from '../utils/DeskWalletRequestUtils';

describe('CarmentisDeskAuthService', () => {
	let dataSource: DataSource;
	let challenges: DeskAuthChallengeService;
	let service: CarmentisDeskAuthService;

	/** Signs `challenge` with a freshly generated wallet, exactly as a real Desk would. */
	async function signChallenge(challenge: string) {
		const wallet = WalletCrypto.generateWallet();
		const sk = await wallet.getDefaultAccountCrypto().getPrivateSignatureKey();
		const pk = await sk.getPublicKey();
		const message = encodeAuthChallengeRequest(challenge);
		const signature = await sk.sign(message);
		const encoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		return {
			publicKey: await encoder.encodePublicKey(pk),
			signature: encoder.encodeSignature(signature),
		};
	}

	beforeEach(async () => {
		dataSource = new DataSource({
			type: 'sqlite',
			database: ':memory:',
			synchronize: true,
			entities: [DeskAuthChallengeEntity],
		});
		await dataSource.initialize();
		challenges = new DeskAuthChallengeService(dataSource.getRepository(DeskAuthChallengeEntity));
		service = new CarmentisDeskAuthService(challenges);
	});

	afterEach(async () => {
		await dataSource.destroy();
	});

	it('verifies a correctly signed challenge and returns the wallet public key', async () => {
		const { challenge } = await service.startChallenge();
		const { publicKey, signature } = await signChallenge(challenge);

		const result = await service.verifySignedChallenge({ challenge, publicKey, signature });
		expect(result).toBe(publicKey);
	});

	it('rejects a signature produced over a different challenge', async () => {
		const { challenge } = await service.startChallenge();
		const { publicKey, signature } = await signChallenge('some-other-challenge');

		await expect(
			service.verifySignedChallenge({ challenge, publicKey, signature }),
		).rejects.toThrow(UnauthorizedException);
	});

	it('rejects a signature that does not match the claimed public key', async () => {
		const { challenge } = await service.startChallenge();
		const { signature } = await signChallenge(challenge);
		const { publicKey: otherPublicKey } = await signChallenge(challenge);

		await expect(
			service.verifySignedChallenge({ challenge, publicKey: otherPublicKey, signature }),
		).rejects.toThrow(UnauthorizedException);
	});

	it('rejects reuse of an already-verified challenge (replay protection)', async () => {
		const { challenge } = await service.startChallenge();
		const { publicKey, signature } = await signChallenge(challenge);

		await service.verifySignedChallenge({ challenge, publicKey, signature });
		await expect(
			service.verifySignedChallenge({ challenge, publicKey, signature }),
		).rejects.toThrow(BadRequestException);
	});

	it('rejects a challenge that was never issued', async () => {
		const { publicKey, signature } = await signChallenge('never-issued');
		await expect(
			service.verifySignedChallenge({ challenge: 'never-issued', publicKey, signature }),
		).rejects.toThrow(BadRequestException);
	});
});
