import { SdJwtVerifiablePresentationVerificationRequestDto } from '../../dto/vc/SdJwtVerifiableCredentialVerificationRequestDto';
import { SdJwtCredentialVerificationResultDto } from '../../dto/vc/SdJwtCredentialVerificationResultDto';

export interface IVerifiablePresentationHandler {
	verifyPresentationRequest(request: SdJwtVerifiablePresentationVerificationRequestDto): Promise<SdJwtCredentialVerificationResultDto>;
}