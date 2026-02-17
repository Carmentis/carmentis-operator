import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EncryptedColumn } from '../decorators/EncryptionDecorator';
import { ApplicationEntity } from './ApplicationEntity';
import { Provider, ProviderFactory } from '@cmts-dev/carmentis-sdk/server';

@Entity('wallet')
export class WalletEntity extends BaseEntity {

	@PrimaryGeneratedColumn()
	walletId: number;

	@EncryptedColumn()
	seed: string;

	@Column()
	rpcEndpoint: string;

	@OneToMany(() => ApplicationEntity, app => app.wallet, { cascade: true })
	applications: ApplicationEntity[];


	getProvider(): Provider {
		return ProviderFactory.createInMemoryProviderWithExternalProvider(this.rpcEndpoint);
	}

}
