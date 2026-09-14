import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type WebauthnChallengePurpose = 'registration' | 'authentication';

/**
 * Server-side bookkeeping for an in-flight WebAuthn ceremony, bridging the "generate options"
 * and "verify response" calls. Persisted (rather than kept in a signed cookie) so that a
 * challenge can be atomically marked `consumed` exactly once, which is what prevents replay
 * and race conditions between concurrent verify attempts for the same challenge.
 *
 * For registration ceremonies started before a UserEntity exists (initial setup, invitation
 * registration), the pending identity is captured here at "options" time and never re-trusted
 * from client input at "verify" time.
 */
@Entity('webauthn_challenge')
export class WebauthnChallengeEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	challenge: string;

	@Column()
	purpose: WebauthnChallengePurpose;

	/** Set for authentication ceremonies once resolved, and for "add another passkey" registrations. */
	@Column({ nullable: true })
	userId?: number;

	/** Base64url random handle used as the WebAuthn user.id before a UserEntity exists. */
	@Column({ nullable: true })
	pendingUserHandle?: string;

	@Column({ nullable: true })
	pendingPseudo?: string;

	@Column({ nullable: true })
	pendingEmail?: string;

	/** Invitation this pending registration is tied to, re-validated again at verify time. */
	@Column({ nullable: true })
	invitationId?: string;

	@Column({ default: false })
	consumed: boolean;

	@Column()
	expiresAt: Date;

	@CreateDateColumn()
	createdAt: Date;
}
