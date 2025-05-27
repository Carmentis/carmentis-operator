import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('challenges')
export class ChallengeEntity {
	@Field(type => String)
	@PrimaryColumn({ type: 'varchar', length: 255 })
	challenge: string;

	@CreateDateColumn()
	validUntil: Date;
}