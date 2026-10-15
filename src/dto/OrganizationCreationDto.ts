import { IsUUID } from 'class-validator';
import { OrganizationUpdateDto } from './OrganizationUpdateDto';

/** The description of an organization is fully required on-chain, so it is required here too. */
export class OrganizationCreationDto extends OrganizationUpdateDto {
	@IsUUID()
	walletId: string;
}
