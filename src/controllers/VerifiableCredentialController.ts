import { Body, Controller, Logger, Post } from '@nestjs/common';
import {
	VerifiableCredentialFormat,
	SdJwtVerifiableCredentialVerificationRequestDto, SdJwtVerifiablePresentationVerificationRequestDto,
} from '../dto/vc/SdJwtVerifiableCredentialVerificationRequestDto';
import { IVerifiableCredentialHandler } from '../utils/vc/IVerifiableCredentialHandler';
import { SdJwtVerifiableCredentialHandler } from '../utils/vc/SdJwtVerifiableCredentialHandler';

@Controller('/api')
export class VerifiableCredentialController {

	private logger = new Logger();
	private readonly verifiableCredentialHandlers: Map<VerifiableCredentialFormat, IVerifiableCredentialHandler> = new Map([
		[VerifiableCredentialFormat.SD_JWT_VC, new SdJwtVerifiableCredentialHandler()]
	]);

	private getExploredFormatsFormRequest(verificationRequest: SdJwtVerifiableCredentialVerificationRequestDto) {
		if (verificationRequest.allowedFormats) {
			return verificationRequest.allowedFormats;
		}
		return Array.from(this.verifiableCredentialHandlers.keys());
	}

	@Post('/vc/sdjwt/verify')
	async verifyVerifiableCredential(
		@Body() verificationRequest: SdJwtVerifiableCredentialVerificationRequestDto
	) {
		try {
			const handler = new SdJwtVerifiableCredentialHandler();
			return await handler.verifyCredentialRequest(verificationRequest);
		} catch (error) {
			this.logger.error(`Error verifying credential: ${error}`);
			return { success: false, error: error.message };
		}
	}

	@Post('/vp/sdjwt/verify')
	async verifyVerifiablePresentation(
		@Body() verificationRequest: SdJwtVerifiablePresentationVerificationRequestDto
	) {
		try {
			const handler = new SdJwtVerifiableCredentialHandler();
			return await handler.verifyPresentationRequest(verificationRequest);
		} catch (error) {
			this.logger.error(`Error verifying credential: ${error}`);
			return { success: false, error: error.message };
		}
	}


}