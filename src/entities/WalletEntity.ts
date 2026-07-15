import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EncryptedColumn } from '../decorators/EncryptionDecorator';
import { ApplicationEntity } from './ApplicationEntity';
import {
	Provider,
	ProviderFactory,
	PublicKeyEncryptionSchemeId,
	SignatureSchemeId,
} from '@cmts-dev/carmentis-sdk-core';

@Entity('wallet')
export class WalletEntity extends BaseEntity {

	@PrimaryGeneratedColumn()
	walletId: number;

	@Column()
	signatureSchemeId: number = SignatureSchemeId.SECP256K1;

	@Column()
	publicKeyEncryptionSchemeId: number = PublicKeyEncryptionSchemeId.ML_KEM_768_AES_256_GCM

	@EncryptedColumn()
	seed: string;

	@Column()
	name: string;

	@CreateDateColumn()
	createdAt: Date;

	@Column()
	rpcEndpoint: string;

	@OneToMany(() => ApplicationEntity, app => app.wallet, { cascade: true })
	applications: ApplicationEntity[];


	getProvider(): Provider {
		return ProviderFactory.createInMemoryProviderWithExternalProvider(this.rpcEndpoint);
	}

}
