import { IsUUID } from 'class-validator';
import { ApplicationUpdateDto } from './ApplicationUpdateDto';

export class ApplicationCreationDto extends ApplicationUpdateDto {
	@IsUUID()
	walletId: string;

	@IsUUID()
	organizationId: string;
}
