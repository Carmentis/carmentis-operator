import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('challenges')
export class ChallengeEntity {
	@PrimaryColumn({ type: 'varchar', length: 255 })
	challenge: string;

	@CreateDateColumn()
	validUntil: Date;
}