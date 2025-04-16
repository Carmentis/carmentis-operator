import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { ApplicationEntity } from '../../../entities/application.entity';
import { ApplicationType } from '../../object-types/application.type';
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
	domain: string;

	@Field(type => String, {nullable: true})
	website: string;
}