import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { API_V1 } from '../../api/ApiVersion';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';
import { WalletEntity } from '../../entities/WalletEntity';
import { OnChainPublicationService } from '../../services/OnChainPublicationService';
import {
	CustomSectionPublicationDto,
	MicroblockPublicationResponseDto,
} from '../../dto/CustomSectionPublicationDto';

@ApiTags('Wallet Organization')
@Controller({ path: '', version: API_V1 })
export class WalletOrganizationController {
	constructor(private readonly publicationService: OnChainPublicationService) {}

	@ApiOperation({
		summary: 'Publish a custom JSON on an organization',
		description:
			'Publishes a custom JSON section on the virtual blockchain of an organization owned by the wallet. ' +
			'The microblock is signed by the wallet and its fees are paid by the account the wallet is attached to.',
	})
	@ApiBody({ type: CustomSectionPublicationDto })
	@ApiCreatedResponse({ type: MicroblockPublicationResponseDto })
	@ApiSecurity('api-key')
	@Post('/wallet/:walletId/organization/:organizationVbId/anchor/json')
	async publishCustomSection(
		@Param('walletId', WalletByIdPipe) wallet: WalletEntity,
		@Param('organizationVbId') organizationVbId: string,
		@Body() dto: CustomSectionPublicationDto,
	): Promise<MicroblockPublicationResponseDto> {
		return this.publicationService.publishCustomSection(wallet, organizationVbId, dto.json);
	}
}
