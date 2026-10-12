import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WalletEntity } from './WalletEntity';
import { ApplicationEntity } from './ApplicationEntity';

/**
 * Local registry entry of an organization.
 *
 * `vbId` is null while the organization only exists locally (draft) and is set once the
 * organization has been published on-chain, or when an on-chain organization is imported.
 */
@Entity('organization')
export class OrganizationEntity extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', nullable: true, unique: true })
	vbId: string | null;

	@Column()
	name: string;

	@Column({ default: '' })
	city: string;

	@Column({ default: '' })
	countryCode: string;

	@Column({ default: '' })
	website: string;

	@CreateDateColumn()
	createdAt: Date;

	@ManyToOne(() => WalletEntity, wallet => wallet.organizations, { onDelete: 'CASCADE', nullable: false })
	wallet: WalletEntity;

	@OneToMany(() => ApplicationEntity, application => application.organization)
	applications: ApplicationEntity[];
}
