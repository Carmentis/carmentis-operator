import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrganisationAccessRightEntity } from './OrganisationAccessRightEntity';
import { ApplicationEntity } from './ApplicationEntity';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { EncryptedColumn } from '../decorators/EncryptionDecorator';
import {
	Hash,
	PrivateSignatureKey,
	PublicSignatureKey,
	SignatureSchemeId,
	WalletCrypto,
} from '@cmts-dev/carmentis-sdk/server';
import { NodeEntity } from './NodeEntity';

@ObjectType()
@Entity('organisation')
export class OrganisationEntity extends BaseEntity {
	@Field(type => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field(type => String)
	@Column()
	name: string;

	@Field(type => String, {nullable: true})
	@Column({
		nullable: true,
	})
	logoUrl: string;

	@Field(type => Date, { nullable: true })
	@Column({nullable: true})
	lastPublicationCheckTime: Date;

	@Field(type => Date, { nullable: true })
	@Column({nullable: true})
	publishedAt: Date;

	@Field(type => Boolean)
	@Column({default: true})
	isDraft: boolean;

	@Field(type => String)
	@Column({default: ''})
	city: string;

	@Field(type => String)
	@Column({default: ''})
	countryCode: string;

	@Field(type => String)
	@Column({default: ''})
	website: string;

	@EncryptedColumn()
	walletSeed: string;

	@OneToMany(() => ApplicationEntity, (app) => app.organisation, { cascade: true })
	applications: ApplicationEntity[];

	@OneToMany(() => NodeEntity, (node) => node.organisation, { cascade: true })
	nodes: NodeEntity[];

	@Field(type => Date)
	@Column({ default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Field(type => Date)
	@UpdateDateColumn()
	@Column({ default: () => 'CURRENT_TIMESTAMP' })
	lastUpdateAt: Date;

	@OneToMany(() => OrganisationAccessRightEntity, (perm) => perm.organisation, { cascade: true })
	accessRights: OrganisationAccessRightEntity[];

	@Field(type => Int)
	@Column({default: 0})
	version: number;

	@Field(type => String, {nullable: true})
	@Column({nullable: true})
	virtualBlockchainId: string;

	isPublished(): boolean {
		return this.hasVirtualBlockchainId() && this.lastPublicationCheckTime !== null;
	}

	isPublicationPending(): boolean {
		return this.hasVirtualBlockchainId() && this.lastPublicationCheckTime === null;
	}

	getVirtualBlockchainId(): Hash {
		return Hash.from(this.virtualBlockchainId);
	}

	getWallet(): WalletCrypto {
		return WalletCrypto.parseFromString(this.walletSeed);
	}

	async getPrivateSignatureKey(schemeId: SignatureSchemeId = SignatureSchemeId.SECP256K1): Promise<PrivateSignatureKey> {
		const wallet = this.getWallet();
		return wallet
			.getDefaultAccountCrypto()
			.getPrivateSignatureKey(schemeId);
		//return wallet.getPrivateSignatureKey();
	}

	async getPublicSignatureKey(schemeId: SignatureSchemeId = SignatureSchemeId.SECP256K1): Promise<PublicSignatureKey> {
		const privateKey = await this.getPrivateSignatureKey(schemeId);
		return privateKey.getPublicKey();
	}

	getId() {
		return this.id;
	}

	isReadyToBePublished() {
		return this.isCountryCodeDefined() &&
			this.isCityDefined() &&
			this.isWebsiteDefined();
	}

	isCountryCodeDefined() {
		return this.countryCode.length == 2;
	}

	isCityDefined() {
		return this.city.length > 0;
	}

	isWebsiteDefined() {
		return this.website.length > 0;
	}

	hasVirtualBlockchainId() {
		return typeof this.virtualBlockchainId === 'string' && this.virtualBlockchainId.length > 0;
	}
}