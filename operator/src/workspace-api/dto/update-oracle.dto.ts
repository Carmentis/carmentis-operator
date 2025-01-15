import { OracleDataType } from '../types/oracle-data.type';
import { IsDefined, IsString } from 'class-validator';

export class UpdateOracleDto {
	@IsString()
	name: string;

	@IsDefined()
	data: OracleDataType;
}