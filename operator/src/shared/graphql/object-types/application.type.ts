import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AutoMap } from '@automapper/classes';


@ObjectType()
export class ApplicationType {

	@AutoMap()
	@Field(type => Int)
	id: number;

	@AutoMap()
	@Field(type => String)
	name: string;

	@AutoMap()
	@Field(type => Int)
	version: number;

	@AutoMap()
	@Field(type => String, {nullable: true})
	logoUrl: string;


	@AutoMap()
	@Field(type => String, {nullable: true})
	description: string;

	@AutoMap()
	@Field(type => String, {nullable: true})
	domain: string;

	@AutoMap()
	@Field(type => String, {nullable: true})
	website: string;

	@AutoMap()
	@Field(type => String, {nullable: true})
	virtualBlockchainId: string;

	@AutoMap()
	@Field(type => Date)
	lastUpdateAt: Date;

	@AutoMap()
	@Field(type => Date)
	createdAt: Date;

	@AutoMap()
	@Field(type => Boolean)
	published: boolean;

	@AutoMap()
	@Field(type => Date, {nullable: true})
	publishedAt: Date;

	@AutoMap()
	@Field(type => Boolean)
	isDraft: boolean;
}