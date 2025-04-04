import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('challenges')
export class ChallengeEntity {
	@PrimaryColumn({ type: 'varchar', length: 255 })
	challenge: string;

	@CreateDateColumn()
	validUntil: Date;
}