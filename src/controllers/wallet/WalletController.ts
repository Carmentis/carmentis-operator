import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { API_V1 } from '../../api/ApiVersion';
import { WalletService } from '../../services/WalletService';
import { WalletDto } from '../../dto/WalletDto';
import { WalletOrganizationDto } from '../../dto/CustomSectionPublicationDto';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';
import { WalletEntity } from '../../entities/WalletEntity';
import { OrganizationService } from '../../services/OrganizationService';
import { WalletApplicationDto } from '../../dto/WalletApplicationDto';
import { toWalletApplicationDto } from './WalletApplicationController';
import { ApplicationService } from '../../services/ApplicationService';

@ApiTags('Wallet')
@Controller({ path: '', version: API_V1 })
export class WalletController {
	constructor(
		private readonly applicationService: ApplicationService,
		private readonly organizationService: OrganizationService,
		private readonly walletService: WalletService
	) {}

	@ApiOperation({
		summary: 'List the wallets',
		description: 'Returns the wallets known by the operator. Secrets (seed, actor passphrase) are never returned.',
	})
	@ApiOkResponse({ type: WalletDto, isArray: true })
	@ApiSecurity('api-key')
	@Get('/wallet')
	async listWallets(): Promise<WalletDto[]> {
		const wallets = await this.walletService.findAll();
		return wallets.map(({ id, name, rpcEndpoint, indexerEndpoint, createdAt }) => ({
			id,
			name,
			rpcEndpoint,
			indexerEndpoint,
			createdAt,
		}));
	}

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
		summary: 'List the applications of a wallet',
		description:
			'Returns the applications of the local registry owned by the wallet. ' +
			'`vbId` is null for an application that is not published on-chain yet.',
	})
	@ApiOkResponse({ type: WalletApplicationDto, isArray: true })
	@ApiSecurity('api-key')
	@Get('/wallet/:walletId/application')
	async listApplications(@Param('walletId', WalletByIdPipe) wallet: WalletEntity): Promise<WalletApplicationDto[]> {
		const applications = await this.applicationService.listApplicationsOfWallet(wallet.id);
		return applications.map(toWalletApplicationDto);
	}

}
