import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
	AuthenticationResponseJSON,
	generateAuthenticationOptions,
	generateRegistrationOptions,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
	RegistrationResponseJSON,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
	WebAuthnCredential,
} from '@simplewebauthn/server';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperatorConfigService } from '../config/services/operator-config.service';
import { WebauthnChallengeService } from './WebauthnChallengeService';
import { UserCredentialEntity } from '../entities/UserCredentialEntity';
import { WebauthnChallengeEntity } from '../entities/WebauthnChallengeEntity';

export interface BeginRegistrationParams {
	userName: string;
	userDisplayName: string;
	excludeCredentials?: { id: string; transports?: string[] }[];
	/** Metadata carried on the challenge row and returned as-is at `finishRegistration` time. */
	userId?: number;
	pendingPseudo?: string;
	pendingEmail?: string;
	invitationId?: string;
}

export interface RegistrationResult {
	challengeRow: WebauthnChallengeEntity;
	credentialId: string;
	publicKey: string;
	counter: number;
	transports?: string[];
	deviceType: string;
	backedUp: boolean;
}

export interface AuthenticationResult {
	credential: UserCredentialEntity;
}

/**
 * Thin orchestration layer around @simplewebauthn/server. All FIDO2 cryptographic
 * verification (signatures, attestation, origin/RP ID checks, counter comparisons) is
 * delegated to that library — nothing here re-implements it. This service only handles:
 * turning our stored config into the options the library expects, persisting/consuming
 * the server-side challenge (see WebauthnChallengeService for replay protection), and
 * resolving credentials to/from our database.
 */
@Injectable()
export class WebauthnService {
	private logger = new Logger(WebauthnService.name);

	constructor(
		@InjectRepository(UserCredentialEntity)
		private readonly credentialRepository: Repository<UserCredentialEntity>,
		private readonly challengeService: WebauthnChallengeService,
		private readonly config: OperatorConfigService,
	) {}

	async beginRegistration(params: BeginRegistrationParams): Promise<PublicKeyCredentialCreationOptionsJSON> {
		const { rpName, rpID } = this.config.getWebauthnConfig();
		const userHandle = randomBytes(32);

		const options = await generateRegistrationOptions({
			rpName,
			rpID,
			userID: userHandle,
			userName: params.userName,
			userDisplayName: params.userDisplayName,
			attestationType: 'none',
			excludeCredentials: params.excludeCredentials,
			authenticatorSelection: {
				residentKey: 'required',
				userVerification: 'preferred',
			},
		});

		await this.challengeService.create({
			challenge: options.challenge,
			purpose: 'registration',
			userId: params.userId,
			pendingUserHandle: userHandle.toString('base64url'),
			pendingPseudo: params.pendingPseudo,
			pendingEmail: params.pendingEmail,
			invitationId: params.invitationId,
		});

		return options;
	}

	async finishRegistration(response: RegistrationResponseJSON): Promise<RegistrationResult> {
		const { origins, rpID } = this.config.getWebauthnConfig();
		const challenge = this.extractChallenge(response.response.clientDataJSON);
		const challengeRow = await this.challengeService.consume(challenge, 'registration');

		const verification = await verifyRegistrationResponse({
			response,
			expectedChallenge: challenge,
			expectedOrigin: origins,
			expectedRPID: rpID,
		});

		if (!verification.verified || !verification.registrationInfo) {
			throw new UnauthorizedException('WebAuthn registration could not be verified');
		}

		const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
		return {
			challengeRow,
			credentialId: credential.id,
			publicKey: Buffer.from(credential.publicKey).toString('base64url'),
			counter: credential.counter,
			transports: credential.transports,
			deviceType: credentialDeviceType,
			backedUp: credentialBackedUp,
		};
	}

	async beginAuthentication(): Promise<PublicKeyCredentialRequestOptionsJSON> {
		const { rpID } = this.config.getWebauthnConfig();

		const options = await generateAuthenticationOptions({
			rpID,
			userVerification: 'preferred',
		});

		await this.challengeService.create({
			challenge: options.challenge,
			purpose: 'authentication',
		});

		return options;
	}

	async finishAuthentication(response: AuthenticationResponseJSON): Promise<AuthenticationResult> {
		const { origins, rpID } = this.config.getWebauthnConfig();
		const challenge = this.extractChallenge(response.response.clientDataJSON);
		await this.challengeService.consume(challenge, 'authentication');

		const storedCredential = await this.credentialRepository.findOne({
			where: { credentialId: response.id },
			relations: ['user'],
		});
		if (!storedCredential) {
			throw new UnauthorizedException('Unknown passkey');
		}

		const credential: WebAuthnCredential = {
			id: storedCredential.credentialId,
			publicKey: new Uint8Array(Buffer.from(storedCredential.publicKey, 'base64url')),
			counter: storedCredential.counter,
			transports: storedCredential.transports as WebAuthnCredential['transports'],
		};

		const verification = await verifyAuthenticationResponse({
			response,
			expectedChallenge: challenge,
			expectedOrigin: origins,
			expectedRPID: rpID,
			credential,
		});

		if (!verification.verified) {
			throw new UnauthorizedException('WebAuthn authentication could not be verified');
		}

		storedCredential.counter = verification.authenticationInfo.newCounter;
		storedCredential.lastUsedAt = new Date();
		await this.credentialRepository.save(storedCredential);

		return { credential: storedCredential };
	}

	private extractChallenge(clientDataJSON: string): string {
		try {
			const decoded = JSON.parse(Buffer.from(clientDataJSON, 'base64url').toString('utf8'));
			if (typeof decoded.challenge !== 'string') {
				throw new Error('missing challenge field');
			}
			return decoded.challenge;
		} catch (error) {
			this.logger.debug(`Failed to decode clientDataJSON: ${error?.message}`);
			throw new BadRequestException('Malformed WebAuthn response');
		}
	}
}
