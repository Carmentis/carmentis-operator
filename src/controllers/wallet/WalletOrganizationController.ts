import { JsonObject } from '@cmts-dev/carmentis-sdk-core';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { API_V1 } from '../../api/ApiVersion';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';
import { WalletEntity } from '../../entities/WalletEntity';
import { OrganizationService } from '../../services/OrganizationService';
import { OnChainPublicationService } from '../../services/OnChainPublicationService';
import {
	CertificatePublicationDto,
	MicroblockPublicationResponseDto,
	WalletOrganizationDto,
} from '../../dto/CustomSectionPublicationDto';

@ApiTags('Wallet Organization')
@Controller({ path: '', version: API_V1 })
export class WalletOrganizationController {
	constructor(
		private readonly publicationService: OnChainPublicationService,
		private readonly organizationService: OrganizationService,
	) {}

	@ApiOperation({
		summary: 'List the organizations of a wallet',
		description:
			'Returns the organizations of the local registry owned by the wallet. ' +
			'`vbId` is null for an organization that is not published on-chain yet.',
	})
	@ApiOkResponse({ type: WalletOrganizationDto, isArray: true })
	@ApiSecurity('api-key')
	@Get('/wallet/:walletId/organization')
	async listOrganizations(@Param('walletId', WalletByIdPipe) wallet: WalletEntity): Promise<WalletOrganizationDto[]> {
		const organizations = await this.organizationService.listOrganizationsOfWallet(wallet.id);
		return organizations.map(({ id, vbId, name, city, countryCode, website }) => ({
			id,
			vbId,
			name,
			city,
			countryCode,
			website,
		}));
	}

	@ApiOperation({
		summary: 'Publish a custom JSON on an organization',
		description:
			'Publishes a custom JSON section on the virtual blockchain of an organization owned by the wallet. ' +
				'The request body is the JSON itself. ' +
			'The microblock is signed by the wallet and its fees are paid by the account the wallet is attached to.',
	})
	@ApiBody({ schema: { type: 'object', additionalProperties: true } })
	@ApiCreatedResponse({ type: MicroblockPublicationResponseDto })
	@ApiSecurity('api-key')
	@Post('/organization/:organizationId/anchor/json')
	async publishCustomSection(
		@Param('organizationId') organizationId: string,
		@Body() json: JsonObject,
	): Promise<MicroblockPublicationResponseDto> {
		const organization = await this.organizationService.getOrganizationById(organizationId)
		const organizationVbId = organization.vbId;
		const wallet = organization.wallet
		return this.publicationService.publishCustomSection(wallet, organizationVbId, json);
	}

	@ApiOperation({
		summary: 'Publish an X.509 certificate on an organization',
		description:
			'Publishes an X.509 certificate (PEM) on the virtual blockchain of an organization owned by the wallet, ' +
			'as `{ __certificate__: { type: "PEM", content } }`. The microblock is signed by the wallet and its fees ' +
			'are paid by the account the wallet is attached to.',
	})
	@ApiBody({ type: CertificatePublicationDto })
	@ApiCreatedResponse({ type: MicroblockPublicationResponseDto })
	@ApiSecurity('api-key')
	@Post('/organization/:organizationId/anchor/certificate')
	async publishCertificate(
		@Param('organizationId') organizationId: string,
		@Body() dto: CertificatePublicationDto,
	): Promise<MicroblockPublicationResponseDto> {
		const organization = await this.organizationService.getOrganizationById(organizationId)
		const organizationVbId = organization.vbId;
		const wallet = organization.wallet
		return this.publicationService.publishCertificate(wallet, organizationVbId, dto.pemCertificate);
	}
}
