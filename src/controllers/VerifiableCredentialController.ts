import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
	VerifiableCredentialFormat,
	SdJwtVerifiableCredentialVerificationRequestDto, SdJwtVerifiablePresentationVerificationRequestDto,
} from '../dto/vc/SdJwtVerifiableCredentialVerificationRequestDto';
import { IVerifiableCredentialHandler } from '../utils/vc/IVerifiableCredentialHandler';
import {
	SdJwtVerifiableCredentialHandler,
	SdJwtVerifiableCredentialVerificationResponseDto,
} from '../utils/vc/SdJwtVerifiableCredentialHandler';
import { SdJwtCredentialVerificationResultDto } from '../dto/vc/SdJwtCredentialVerificationResultDto';

@ApiTags('Verifiable Credentials')
@Controller('/api')
export class VerifiableCredentialController {

	private logger = new Logger();

	@ApiOperation({
		summary: 'Verify an SD-JWT verifiable credential',
		description: 'Verifies the authenticity and validity of a Selective Disclosure JWT (SD-JWT) verifiable credential.'
	})
	@ApiResponse({
		status: 200,
		description: 'The credential verification result.',
		type: SdJwtCredentialVerificationResultDto
	})
	@Post('/vc/sdjwt/verify')
	async verifyVerifiableCredential(
		@Body() verificationRequest: SdJwtVerifiableCredentialVerificationRequestDto
	): Promise<SdJwtCredentialVerificationResultDto> {
		try {
			const handler = new SdJwtVerifiableCredentialHandler();
			return await handler.verifyCredentialRequest(verificationRequest);
		} catch (error) {
			this.logger.error(`Error verifying credential: ${error}`);
			return { success: false, errors: [error.message] };
		}
	}

	@ApiOperation({
		summary: 'Verify an SD-JWT verifiable presentation',
		description: 'Verifies the authenticity and validity of a Selective Disclosure JWT (SD-JWT) verifiable presentation.'
	})
	@ApiResponse({
		status: 200,
		description: 'The presentation verification result.',
		type: SdJwtCredentialVerificationResultDto
	})
	@Post('/vp/sdjwt/verify')
	async verifyVerifiablePresentation(
		@Body() verificationRequest: SdJwtVerifiablePresentationVerificationRequestDto
	): Promise<SdJwtCredentialVerificationResultDto> {
		try {
			const handler = new SdJwtVerifiableCredentialHandler();
			return await handler.verifyPresentationRequest(verificationRequest);
		} catch (error) {
			this.logger.error(`Error verifying credential: ${error}`);
			return { success: false, errors: [error.message] };
		}
	}


}