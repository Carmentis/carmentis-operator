import { IVerifiableCredentialHandler } from './IVerifiableCredentialHandler';
import { decodeJwt, SafeVerifyResult, SDJwt, getClaimsSync } from '@sd-jwt/core';
import { digest } from '@sd-jwt/crypto-nodejs';
import { match, P } from 'ts-pattern';
import { CryptoUtils } from '../CryptoUtils';
import { DidUtils } from '../did/DidUtils';
import { SDJwtVcInstance, VerificationResult } from '@sd-jwt/sd-jwt-vc';
import {
	SdJwtVerifiableCredentialVerificationRequestDto,
	SdJwtVerifiablePresentationVerificationRequestDto,
} from '../../dto/vc/SdJwtVerifiableCredentialVerificationRequestDto';
import { SdJwtCredentialVerificationResultDto } from '../../dto/vc/SdJwtCredentialVerificationResultDto';
import { IVerifiablePresentationHandler } from './IVerifiablePresentationHandler';

export interface SdJwtVerifiableCredentialVerificationResponseDto extends SdJwtCredentialVerificationResultDto {
	parsedCredential: object;
	claims: object;
}

export class SdJwtVerifiableCredentialHandler implements IVerifiableCredentialHandler, IVerifiablePresentationHandler {
	async verifyCredentialRequest(request: SdJwtVerifiableCredentialVerificationRequestDto): Promise<SdJwtVerifiableCredentialVerificationResponseDto> {
		// ensure we support the sd-jwt
		const { credential, expectedSubject } = request;
		const trustedIssuers = request.trustedIssuers ?? [];
		if (typeof credential !== 'string') {
			throw new Error('Supports only encoded (string) credential');
		}

		// parse the credential
		const parsedCredential = await SDJwt.decodeSDJwt(credential, digest);
		const claims = getClaimsSync(parsedCredential.jwt.payload, parsedCredential.disclosures, digest);

		// ensure subject is the expected one (if provided)
		const payload = parsedCredential.jwt.payload;
		match(payload)
			.with({ sub: P.string }, ({sub}) => {
				if (!!expectedSubject && expectedSubject !== sub) {
					throw new Error('Subject is not the expected one');
				}
			})
			// if not provided, raise an exception
			.otherwise(() => { throw new Error('Subject is not provided') })


		// ensure the verifier belongs to the set of trusted credentials

		const issuerVerifier = await match(payload)
			.with({ iss: P.string }, ({iss: issuer}) => {
				// always accept if no trusted issuers are provided
				// ensure the issuer is trusted
				if (trustedIssuers.length !== 0 && !trustedIssuers.includes(issuer)) {
					throw new Error('Issuer is not trusted');
				}

				return this.convertIssuerToSdJwtVerifier(issuer);
			})
			// if not provided, raise an exception
			.otherwise(() => { throw new Error('Issuer is not provided') })


		const instance = new SDJwtVcInstance({
			hasher: digest,
			hashAlg: 'sha-256',
			verifier: issuerVerifier,
			statusVerifier: issuerVerifier,
		});
		const requiredClaimKeys = request.requiredClaimKeys ?? [];
		const verificationResult = await instance.safeVerify(credential, {
			disableStatusVerification: request.disableStatusVerification,
			requiredClaimKeys: requiredClaimKeys,
		});

		return this.constructResponseFromVerificationResult(parsedCredential, claims, verificationResult)
	}


	async verifyPresentationRequest(request: SdJwtVerifiablePresentationVerificationRequestDto): Promise<SdJwtVerifiableCredentialVerificationResponseDto> {
		// ensure we support the sd-jwt
		const { credential, expectedSubject } = request;
		const trustedIssuers = request.trustedIssuers ?? [];
		if (typeof credential !== 'string') {
			throw new Error('Supports only encoded (string) credential');
		}

		// parse the credential
		const parsedCredential = await SDJwt.decodeSDJwt(credential, digest);
		const claims = getClaimsSync(parsedCredential.jwt.payload, parsedCredential.disclosures, digest);

		// ensure subject is the expected one (if provided)
		const payload = parsedCredential.jwt.payload;
		match(payload)
			.with({ sub: P.string }, ({sub}) => {
				if (!!expectedSubject && expectedSubject !== sub) {
					throw new Error('Subject is not the expected one');
				}
			})
			// if not provided, raise an exception
			.otherwise(() => { throw new Error('Subject is not provided') })


		// ensure the verifier belongs to the set of trusted credentials

		const issuerVerifier = await match(payload)
			.with({ iss: P.string }, ({iss: issuer}) => {
				// always accept if no trusted issuers are provided
				// ensure the issuer is trusted
				if (trustedIssuers.length !== 0 && !trustedIssuers.includes(issuer)) {
					throw new Error('Issuer is not trusted');
				}

				return this.convertIssuerToSdJwtVerifier(issuer);
			})
			// if not provided, raise an exception
			.otherwise(() => { throw new Error('Issuer is not provided') })

		const subjectVerifier = await match(payload)
			.with({ sub: P.string }, ({sub: subject}) => {
				return this.convertSubjectToSdJwtVerifier(subject);
			})
			// if not provided, raise an exception
			.otherwise(() => { throw new Error('Subject is not provided') })


		const instance = new SDJwtVcInstance({
			hasher: digest,
			hashAlg: 'sha-256',
			verifier: issuerVerifier,
			statusVerifier: issuerVerifier,
			kbVerifier: subjectVerifier,
		});
		const requiredClaimKeys = request.requiredClaimKeys ?? [];
		const verificationResult = await instance.safeVerify(credential, {
			disableStatusVerification: request.disableStatusVerification,
			requiredClaimKeys: requiredClaimKeys,
			keyBindingNonce: request.nonce,
		});

		return this.constructResponseFromVerificationResult(parsedCredential, claims, verificationResult)
	}

	private async convertIssuerToSdJwtVerifier(party: string) {
		const pk = await DidUtils.resolveDidAsCryptoKey(party);
		const jwk = await CryptoUtils.convertCryptoKeyToJwk(pk);
		return CryptoUtils.createSdJwtVerifierFromJwk(jwk);
	}

	private async convertSubjectToSdJwtVerifier(party: string) {
		const pk = await CryptoUtils.decodePublicSignatureKey(party);
		return CryptoUtils.createSdJwtVerifierFromPublicKey(pk);
	}

	private async constructResponseFromVerificationResult(parsedCredential: object, claims: object, result:  SafeVerifyResult<VerificationResult>) {
		const errors = result.errors ?? [];
		return {
			success: result.success,
			errors: errors.map((error) => error.message),
			errorCodes: errors.map(e => e.code),
			parsedCredential,
			claims,
		}
	}

}