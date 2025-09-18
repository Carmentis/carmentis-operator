import { Args, Field, InputType, Int } from '@nestjs/graphql';
import { IsISO31661Alpha2, IsNotEmpty, IsUrl, MinLength } from 'class-validator';

@InputType()
export class OrganisationUpdateDto  {

	@Field(type => String)
	@IsNotEmpty()
	@MinLength(2)
	name: string;

	@Field(type => String)
	@IsISO31661Alpha2()
	countryCode: string;

	@Field(type => String)
	@IsUrl()
	website: string;

	@Field(type => String, { nullable: false })
	@IsNotEmpty()
	city: string;
}