import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateOrganisationDto {
	@Field()
	name: string;

	@Field({ nullable: true })
	logoUrl?: string;

	@Field({ nullable: true })
	city?: string;

	@Field({ nullable: true })
	countryCode?: string;

	@Field({ nullable: true })
	website?: string;

	@Field()
	publicSignatureKey: string;

	@Field()
	privateSignatureKey: string;
}