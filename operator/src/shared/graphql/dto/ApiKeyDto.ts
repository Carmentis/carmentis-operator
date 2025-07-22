import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ApiKeyCreationDto  {
	@Field(type => String, { nullable: false })
	name: string;

	@Field(type => String, { nullable: false })
	activeUntil: string;
}
