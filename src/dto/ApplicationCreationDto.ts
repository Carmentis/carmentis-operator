import { IsNumber } from 'class-validator';
import { ApplicationUpdateDto } from './ApplicationUpdateDto';

export class ApplicationCreationDto extends ApplicationUpdateDto {
	@IsNumber()
	walletId: number;

	@IsNumber()
	organizationId: number;
}
