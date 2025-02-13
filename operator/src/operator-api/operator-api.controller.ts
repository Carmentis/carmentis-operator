import { Body, Controller, Logger, Post, UnprocessableEntityException } from '@nestjs/common';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
import { Public } from '../workspace-api/decorators/public.decorator';
import { CryptoService } from './services/crypto.service';
import { PrepareUserApprovalDto } from './dto/prepare-user-approval.dto';
import { OrganisationService } from '../shared/services/organisation.service';
import { EnvService } from '../services/env.service';


@Controller()
export class OperatorApiController{

	private logger = new Logger(OperatorApiController.name);

	constructor(
		private readonly envService: EnvService,
		private readonly organisationService: OrganisationService
	) {
	}


	@Public()
	@Post("/prepareUserApproval")
	async handleRequest(
		@Body() data: PrepareUserApprovalDto
	) {
		// search the organisation by its identifier
		const organisation = await this.organisationService.findOrganisationFromApplicationVirtualBlockchainId(data.applicationId);

		this.logger.log("Handling event approval:")
		const nodeUrl = this.envService.nodeUrl;
		const organisationId = organisation.virtualBlockchainId;
		const organisationPrivateKey = organisation.privateSignatureKey;

		if (!organisationId) throw new UnprocessableEntityException("The organisation is not published yet");

		const core = new sdk.operatorCore(
			nodeUrl,
			organisationId,
			organisationPrivateKey
		);

		return await core.prepareUserApproval({
			...data.data,
			appLedgerId: data.appLedgerVirtualBlockchainId
		});
	}
}