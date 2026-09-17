import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Server-side bookkeeping for an in-flight Carmentis Desk authentication challenge, bridging
 * the "start challenge" and "verify signed challenge" calls. Persisted (rather than kept in a
 * signed cookie) so a challenge can be atomically marked `consumed` exactly once, which is what
 * prevents replay and race conditions between concurrent verify attempts for the same challenge.
 *
 * Unlike the WebAuthn challenge it replaces, this carries no flow-specific data (no pending
 * pseudo/email, no purpose): a Carmentis Desk challenge is just "prove control of a public key",
 * and login/setup/invitation-registration all consume it identically, deciding independently
 * what to do once the signature is verified.
 */
@Entity('desk_auth_challenge')
export class DeskAuthChallengeEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	/** Base64-encoded random challenge, signed by the wallet as part of a `wr-auth-pk` request. */
	@Column({ unique: true })
	challenge: string;

	@Column({ default: false })
	consumed: boolean;

	@Column()
	expiresAt: Date;

	@CreateDateColumn()
	createdAt: Date;
}
