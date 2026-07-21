import { SdJwtVerifiableCredentialVerificationRequestDto } from '../../dto/vc/SdJwtVerifiableCredentialVerificationRequestDto';
import { SdJwtCredentialVerificationResultDto } from '../../dto/vc/SdJwtCredentialVerificationResultDto';

export interface IVerifiableCredentialHandler {
	verifyCredentialRequest(request: SdJwtVerifiableCredentialVerificationRequestDto): Promise<SdJwtCredentialVerificationResultDto>;
}