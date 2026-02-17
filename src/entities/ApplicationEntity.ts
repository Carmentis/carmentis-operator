import { BaseEntity, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { WalletEntity } from './WalletEntity';
import { AnchorRequestEntity } from './AnchorRequestEntity';
import { ApiKeyEntity } from './ApiKeyEntity';

@Entity('application')
export class ApplicationEntity extends BaseEntity {

	@PrimaryColumn()
	vbId: string;

	@ManyToOne(() => WalletEntity, wallet => wallet.applications, { onDelete: 'CASCADE' })
	wallet: WalletEntity;

	@OneToMany(() => AnchorRequestEntity, anchorRequest => anchorRequest.application, { cascade: true })
	anchorRequests: AnchorRequestEntity[];

	@OneToMany(() => ApiKeyEntity, apiKey => apiKey.application, { cascade: true })
	apiKeys: ApiKeyEntity[];
}
