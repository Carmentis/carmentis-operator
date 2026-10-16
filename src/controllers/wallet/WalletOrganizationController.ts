import { JsonObject } from '@cmts-dev/carmentis-sdk-core';
import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { API_V1 } from '../../api/ApiVersion';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';
import { WalletEntity } from '../../entities/WalletEntity';
import { ApplicationService } from '../../services/ApplicationService';
import { OrganizationService } from '../../services/OrganizationService';
import { OnChainPublicationService } from '../../services/OnChainPublicationService';
import {
	CertificatePublicationDto,
	MicroblockPublicationResponseDto,
	WalletOrganizationDto,
} from '../../dto/CustomSectionPublicationDto';
import { WalletApplicationDto } from '../../dto/WalletApplicationDto';
import { toWalletApplicationDto } from './WalletApplicationController';

@ApiTags('Wallet Organization')
@Controller({ path: '', version: API_V1 })
export class WalletOrganizationController {
	constructor(
		private readonly publicationService: OnChainPublicationService,
		private readonly organizationService: OrganizationService,
		private readonly applicationService: ApplicationService,
	) {}



	@ApiOperation({
		summary: 'List the applications of an organization',
		description:
			'Returns the applications of the local registry belonging to the organization. ' +
			'`vbId` is null for an application that is not published on-chain yet.',
	})
	@ApiOkResponse({ type: WalletApplicationDto, isArray: true })
	@ApiSecurity('api-key')
	@Get('/organization/:organizationId/applications')
	async listApplications(
		@Param('organizationId', ParseUUIDPipe) organizationId: string,
	): Promise<WalletApplicationDto[]> {
		const applications = await this.applicationService.listApplicationsOfOrganization(organizationId);
		return applications.map(toWalletApplicationDto);
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
			'as `{ __certificate__: { type: "PEM", pem } }`. The microblock is signed by the wallet and its fees ' +
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
		return this.publicationService.publishCertificate(wallet, organizationVbId, dto.pem);
	}
}
