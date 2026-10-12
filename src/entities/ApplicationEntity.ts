import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WalletEntity } from './WalletEntity';
import { AnchorRequestEntity } from './AnchorRequestEntity';
import { ApiKeyEntity } from './ApiKeyEntity';
import { OrganizationEntity } from './OrganizationEntity';

/**
 * Local registry entry of an application.
 *
 * `vbId` is null while the application only exists locally (draft) and is set once the
 * application has been published on-chain, or when an on-chain application is imported.
 * API keys and anchor requests need an on-chain application, so they only ever reference
 * applications with a `vbId`.
 */
@Entity('application')
export class ApplicationEntity extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', nullable: true, unique: true })
	vbId: string | null;

	@Column()
	name: string;

	@Column({ default: '' })
	description: string;

	@Column({ default: '' })
	homepageUrl: string;

	@Column({ default: '' })
	logoUrl: string;

	@CreateDateColumn()
	createdAt: Date;

	@ManyToOne(() => WalletEntity, wallet => wallet.applications, { onDelete: 'CASCADE', nullable: false })
	wallet: WalletEntity;

	@ManyToOne(() => OrganizationEntity, organization => organization.applications, { nullable: false })
	organization: OrganizationEntity;

	@OneToMany(() => AnchorRequestEntity, anchorRequest => anchorRequest.application, { cascade: true })
	anchorRequests: AnchorRequestEntity[];

	@OneToMany(() => ApiKeyEntity, apiKey => apiKey.application, { cascade: true })
	apiKeys: ApiKeyEntity[];
}
