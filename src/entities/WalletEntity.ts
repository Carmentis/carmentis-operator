import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EncryptedColumn } from '../decorators/EncryptionDecorator';
import { ApplicationEntity } from './ApplicationEntity';
import { ApiKeyEntity } from './ApiKeyEntity';
import { PrivateKeyEntity } from './PrivateKeyEntity';
import {
	Provider,
	ProviderFactory,
	PublicKeyEncryptionSchemeId,
	SignatureSchemeId,
} from '@cmts-dev/carmentis-sdk-core';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity('wallet')
export class WalletEntity extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number;


	@EncryptedColumn()
	actorPassphrase: string;

	@Column()
	actorSignatureSchemeId: number = SignatureSchemeId.SECP256K1;


	@Column()
	actorPublicKeyEncryptionSchemeId: number = PublicKeyEncryptionSchemeId.ML_KEM_768_AES_256_GCM;

	@Column()
	name: string;

	@CreateDateColumn()
	createdAt: Date;

	@Column()
	rpcEndpoint: string;

	@Column()
	indexerEndpoint: string;

	@Column({nullable: true})
	allowedEndpointsRegex?: string;

	@OneToMany(() => ApplicationEntity, app => app.wallet, { cascade: true })
	applications: ApplicationEntity[];

	@OneToMany(() => ApiKeyEntity, apiKey => apiKey.wallet)
	apiKeys: ApiKeyEntity[];

	@ManyToOne(() => PrivateKeyEntity, privateKey => privateKey.wallets)
	privateKey: PrivateKeyEntity;

	getProvider(): Provider {
		return ProviderFactory.createInMemoryProviderWithExternalProvider(this.rpcEndpoint);
	}

}
