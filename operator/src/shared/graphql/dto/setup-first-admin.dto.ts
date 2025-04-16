import { Field, InputType, Int } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class SetupFirstAdminDto {
	@Field()
	@IsString()
	publicKey: string;

	@Field()
	@IsString()
	firstname: string;

	@Field()
	@IsString()
	lastname: string;

	@Field()
	@IsString()
	token: string;
}