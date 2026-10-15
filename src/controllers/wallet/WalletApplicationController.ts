import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { API_V1 } from '../../api/ApiVersion';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';
import { WalletEntity } from '../../entities/WalletEntity';
import { ApplicationEntity } from '../../entities/ApplicationEntity';
import { ApplicationService } from '../../services/ApplicationService';
import { WalletApplicationDto } from '../../dto/WalletApplicationDto';

@ApiTags('Wallet')
@Controller({ path: '', version: API_V1 })
export class WalletApplicationController {
	constructor(private readonly applicationService: ApplicationService) {}


}

export function toWalletApplicationDto({ id, vbId, name, description, homepageUrl, logoUrl, organization }: ApplicationEntity): WalletApplicationDto {
	return { id, vbId, name, description, homepageUrl, logoUrl, organizationId: organization.id };
}
