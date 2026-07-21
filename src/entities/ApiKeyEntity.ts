import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApplicationEntity } from './ApplicationEntity';
import { WalletEntity } from './WalletEntity';
import { EncryptedColumn } from '../decorators/EncryptionDecorator';

/**
 * An API key should have the following new format:
 * cmts:<id>:<applicationId>:<key>
 * where applicationId is optional
 */
@Entity('api-key')
export class ApiKeyEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@EncryptedColumn()
	apiKey: string;

	@ManyToOne(() => ApplicationEntity, app => app.apiKeys, { onDelete: "CASCADE", nullable: true })
	application?: ApplicationEntity;

	@ManyToOne(() => WalletEntity, wallet => wallet.apiKeys, { onDelete: "CASCADE", nullable: true })
	wallet?: WalletEntity;


	@CreateDateColumn()
	createdAt: Date;


	@Column({ nullable: true })
	activeUntil?: Date;


	@Column({default: true})
	isActive: boolean;

	@Column({ nullable: true })
	endpointRegex?: string;

	@Column({ default: 0 })
	gasMinAtomics: number;

	@Column({ default: 1000000 })
	gasMaxAtomics: number;
}