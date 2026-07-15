import { IsInt, IsNumber, IsString } from 'class-validator';

export class GetVirtualBlockchainRecordRequestDto {
	@IsString()
	vbId: string;

	@IsInt()
	height: number
}