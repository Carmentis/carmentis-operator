import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

/**
 * A single WebAuthn/FIDO2 passkey registered by a user. A user can own several of these
 * (e.g. one per device), which is why this is a separate table rather than columns on UserEntity.
 */
@Entity('user_credential')
export class UserCredentialEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => UserEntity, (user) => user.credentials, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	user: UserEntity;

	@Column()
	userId: number;

	/** Base64url-encoded WebAuthn credential ID, unique across all users. */
	@Column({ unique: true })
	credentialId: string;

	/** Base64url-encoded COSE public key for this credential. */
	@Column('text')
	publicKey: string;

	/** Signature counter reported by the authenticator, used to detect cloned authenticators. */
	@Column({ default: 0 })
	counter: number;

	@Column('simple-array', { nullable: true })
	transports?: string[];

	@Column({ nullable: true })
	deviceType?: string;

	@Column({ default: false })
	backedUp: boolean;

	/** Optional user-given nickname (e.g. "MacBook", "iPhone") shown in the passkey management page. */
	@Column({ nullable: true })
	name?: string;

	@CreateDateColumn()
	createdAt: Date;

	@Column({ nullable: true })
	lastUsedAt?: Date;
}
