import { SdJwtVerifiablePresentationVerificationRequestDto } from '../../dto/vc/SdJwtVerifiableCredentialVerificationRequestDto';
import { CredentialVerificationResultDto } from '../../dto/vc/CredentialVerificationResultDto';

export interface IVerifiablePresentationHandler {
	verifyPresentationRequest(request: SdJwtVerifiablePresentationVerificationRequestDto): Promise<CredentialVerificationResultDto>;
}