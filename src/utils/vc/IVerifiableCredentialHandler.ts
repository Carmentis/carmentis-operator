import { SdJwtVerifiableCredentialVerificationRequestDto } from '../../dto/vc/SdJwtVerifiableCredentialVerificationRequestDto';
import { CredentialVerificationResultDto } from '../../dto/vc/CredentialVerificationResultDto';

export interface IVerifiableCredentialHandler {
	verifyCredentialRequest(request: SdJwtVerifiableCredentialVerificationRequestDto): Promise<CredentialVerificationResultDto>;
}