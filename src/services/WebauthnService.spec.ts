import { UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WebauthnChallengeEntity } from '../entities/WebauthnChallengeEntity';
import { UserCredentialEntity } from '../entities/UserCredentialEntity';
import { UserEntity } from '../entities/UserEntity';
import { WebauthnChallengeService } from './WebauthnChallengeService';
import { WebauthnService } from './WebauthnService';

// The FIDO2 cryptographic verification itself belongs to @simplewebauthn/server and is not
// re-tested here. We mock its two `verify*` functions so we can test OUR orchestration
// (challenge lifecycle, credential lookup/storage, counter updates) deterministically, while
// keeping the real `generate*Options` functions since they are pure and side-effect free.
jest.mock('@simplewebauthn/server', () => {
	const actual = jest.requireActual('@simplewebauthn/server');
	return {
		...actual,
		verifyRegistrationResponse: jest.fn(),
		verifyAuthenticationResponse: jest.fn(),
	};
});
// eslint-disable-next-line @typescript-eslint/no-var-requires
const simplewebauthn = require('@simplewebauthn/server');

function encodeClientDataJSON(challenge: string): string {
	return Buffer.from(JSON.stringify({ type: 'webauthn.get', challenge, origin: 'http://localhost:3000' })).toString(
		'base64url',
	);
}

describe('WebauthnService', () => {
	let dataSource: DataSource;
	let challengeService: WebauthnChallengeService;
	let service: WebauthnService;
	const config = {
		getWebauthnConfig: () => ({ rpName: 'Test RP', rpID: 'localhost', origins: ['http://localhost:3000'] }),
	} as any;

	beforeEach(async () => {
		jest.clearAllMocks();
		dataSource = new DataSource({
			type: 'sqlite',
			database: ':memory:',
			synchronize: true,
			entities: [UserEntity, UserCredentialEntity, WebauthnChallengeEntity],
		});
		await dataSource.initialize();

		challengeService = new WebauthnChallengeService(dataSource.getRepository(WebauthnChallengeEntity));
		service = new WebauthnService(dataSource.getRepository(UserCredentialEntity), challengeService, config);
	});

	afterEach(async () => {
		await dataSource.destroy();
	});

	it('registration options omit allowCredentials-style emptiness issues and persist a matching challenge', async () => {
		const options = await service.beginRegistration({ userName: 'alice', userDisplayName: 'alice' });
		expect(options.challenge).toBeTruthy();

		const stored = await dataSource
			.getRepository(WebauthnChallengeEntity)
			.findOne({ where: { challenge: options.challenge } });
		expect(stored).not.toBeNull();
		expect(stored.purpose).toBe('registration');
		expect(stored.consumed).toBe(false);
	});

	it('discoverable authentication options never include an allowCredentials key over the wire', async () => {
		const options = await service.beginAuthentication();
		// Simulates the actual HTTP response body the browser receives.
		const wire = JSON.parse(JSON.stringify(options));
		expect(Object.prototype.hasOwnProperty.call(wire, 'allowCredentials')).toBe(false);
	});

	it('finishes registration by consuming the challenge and returning the credential to persist', async () => {
		const options = await service.beginRegistration({ userName: 'alice', userDisplayName: 'alice' });
		simplewebauthn.verifyRegistrationResponse.mockResolvedValue({
			verified: true,
			registrationInfo: {
				credential: { id: 'cred-1', publicKey: new Uint8Array([1, 2, 3]), counter: 0 },
				credentialDeviceType: 'multiDevice',
				credentialBackedUp: true,
			},
		});

		const fakeResponse: any = {
			id: 'cred-1',
			response: { clientDataJSON: encodeClientDataJSON(options.challenge) },
		};
		const result = await service.finishRegistration(fakeResponse);

		expect(result.credentialId).toBe('cred-1');
		expect(result.deviceType).toBe('multiDevice');

		// The challenge cannot be reused.
		await expect(service.finishRegistration(fakeResponse)).rejects.toThrow();
	});

	it('rejects registration when @simplewebauthn/server reports it as unverified', async () => {
		const options = await service.beginRegistration({ userName: 'alice', userDisplayName: 'alice' });
		simplewebauthn.verifyRegistrationResponse.mockResolvedValue({ verified: false });

		const fakeResponse: any = {
			id: 'cred-1',
			response: { clientDataJSON: encodeClientDataJSON(options.challenge) },
		};
		await expect(service.finishRegistration(fakeResponse)).rejects.toThrow(UnauthorizedException);
	});

	it('rejects authentication against an unknown credential id', async () => {
		const options = await service.beginAuthentication();
		const fakeResponse: any = {
			id: 'does-not-exist',
			response: { clientDataJSON: encodeClientDataJSON(options.challenge) },
		};
		await expect(service.finishAuthentication(fakeResponse)).rejects.toThrow(UnauthorizedException);
	});

	it('rejects authentication with an invalid or expired challenge', async () => {
		const fakeResponse: any = {
			id: 'whatever',
			response: { clientDataJSON: encodeClientDataJSON('not-a-real-challenge') },
		};
		await expect(service.finishAuthentication(fakeResponse)).rejects.toThrow();
	});

	it('authenticates successfully with a stored credential and updates its counter', async () => {
		const userRepository = dataSource.getRepository(UserEntity);
		const user = await userRepository.save(userRepository.create({ pseudo: 'alice' }));
		const credentialRepository = dataSource.getRepository(UserCredentialEntity);
		await credentialRepository.save(
			credentialRepository.create({
				userId: user.id,
				credentialId: 'cred-1',
				publicKey: Buffer.from([1, 2, 3]).toString('base64url'),
				counter: 5,
			}),
		);

		const options = await service.beginAuthentication();
		simplewebauthn.verifyAuthenticationResponse.mockResolvedValue({
			verified: true,
			authenticationInfo: { newCounter: 6 },
		});

		const fakeResponse: any = {
			id: 'cred-1',
			response: { clientDataJSON: encodeClientDataJSON(options.challenge) },
		};
		const result = await service.finishAuthentication(fakeResponse);

		expect(result.credential.user.id).toBe(user.id);
		const reloaded = await credentialRepository.findOneBy({ credentialId: 'cred-1' });
		expect(reloaded.counter).toBe(6);
		expect(reloaded.lastUsedAt).not.toBeNull();
	});

	it('supports a user with multiple passkeys authenticating with either one', async () => {
		const userRepository = dataSource.getRepository(UserEntity);
		const user = await userRepository.save(userRepository.create({ pseudo: 'alice' }));
		const credentialRepository = dataSource.getRepository(UserCredentialEntity);
		await credentialRepository.save(
			credentialRepository.create({ userId: user.id, credentialId: 'laptop', publicKey: 'pub', counter: 0 }),
		);
		await credentialRepository.save(
			credentialRepository.create({ userId: user.id, credentialId: 'phone', publicKey: 'pub', counter: 0 }),
		);
		simplewebauthn.verifyAuthenticationResponse.mockResolvedValue({
			verified: true,
			authenticationInfo: { newCounter: 1 },
		});

		for (const credentialId of ['laptop', 'phone']) {
			const options = await service.beginAuthentication();
			const fakeResponse: any = {
				id: credentialId,
				response: { clientDataJSON: encodeClientDataJSON(options.challenge) },
			};
			const result = await service.finishAuthentication(fakeResponse);
			expect(result.credential.credentialId).toBe(credentialId);
			expect(result.credential.user.id).toBe(user.id);
		}
	});
});
