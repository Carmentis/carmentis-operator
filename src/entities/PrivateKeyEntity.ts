import { BaseEntity, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PrivateKeyObject } from '../types/types';
import { EncryptedColumn } from '../decorators/EncryptionDecorator';
import { WalletEntity } from './WalletEntity';

/**
 * This entity models private signature keys.
 *
 * The private keys are encrypted stored in the database.
 */
@Entity('private_key')
export class PrivateKeyEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@EncryptedColumn()
	privateKey: PrivateKeyObject;

	@CreateDateColumn()
	createdAt: Date;

	@OneToMany(() => WalletEntity, wallet => wallet.privateKey)
	wallets: WalletEntity[];
}