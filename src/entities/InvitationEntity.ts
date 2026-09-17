import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

/**
 * A single-use, time-limited invitation link allowing someone to register a new admin
 * account. Only the sha256 hash of the invitation token is stored; the raw token is only
 * ever returned once, at creation time, and is not recoverable from the database.
 */
@Entity('invitation')
export class InvitationEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	tokenHash: string;

	@ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'createdByUserId' })
	createdBy: UserEntity;

	@Column()
	createdByUserId: number;

	@CreateDateColumn()
	createdAt: Date;

	@Column()
	expiresAt: Date;

	@Column({ nullable: true })
	usedAt?: Date;

	@ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn({ name: 'usedByUserId' })
	usedBy?: UserEntity;

	@Column({ nullable: true })
	usedByUserId?: number;
}
