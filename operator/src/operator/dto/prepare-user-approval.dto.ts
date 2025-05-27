import { IsDefined, IsOptional, IsString } from 'class-validator';

export class PrepareUserApprovalDto {
	@IsString()
	applicationId: string;

	@IsDefined()
	data: object;

	@IsOptional()
	appLedgerVirtualBlockchainId?: string;
}
