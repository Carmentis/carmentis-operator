import { Field, InputType, PartialType } from '@nestjs/graphql';
import { ApplicationType } from '../types/ApplicationType';
import { AutoMap } from '@automapper/classes';

@InputType()
export class ApplicationCreationDto extends PartialType(ApplicationType) {
	@AutoMap()
	@Field(type => String)
	name: string;
}

@InputType()
export class ApplicationUpdateDto extends ApplicationCreationDto {
	@Field(type => String, {nullable: true})
	logoUrl: string;

	@Field(type => String, {nullable: true})
	description: string;

	@Field(type => String, {nullable: true})
	website: string;
}