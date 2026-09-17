import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * An admin account. Identity is the Carmentis wallet's public key, proven at login time by a
 * signed-challenge exchange with Carmentis Desk (see `CarmentisDeskAuthService`) — `publicKey`
 * is never used as a display name. `pseudo` is a separate, mutable, human-friendly label:
 * auto-generated ("User 1", "User 2", …) at registration and renameable afterwards via
 * `UserService.renamePseudo`.
 */
@Entity('user')
export class UserEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	/** Canonical string encoding of the wallet's public signature key, e.g. `sig:secp256k1:pk:...`. */
	@Column({ unique: true })
	publicKey: string;

	@Column({ unique: true })
	pseudo: string;

	@CreateDateColumn()
	createdAt: Date;
}
