import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApplicationEntity } from './ApplicationEntity';
import { EncryptedColumn } from '../decorators/EncryptionDecorator';

/**
 * An API key should have the following new format:
 * cmts:<id>:<applicationId>:<key>
 */
@Entity('api-key')
export class ApiKeyEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@EncryptedColumn()
	apiKey: string;

	@ManyToOne(() => ApplicationEntity, app => app.apiKeys, { onDelete: "CASCADE" })
	application: ApplicationEntity;


	@CreateDateColumn()
	createdAt: Date;


	@Column({ nullable: true })
	activeUntil?: Date;


	@Column({default: true})
	isActive: boolean;
}