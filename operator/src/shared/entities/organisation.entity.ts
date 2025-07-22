import { Column, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrganisationAccessRightEntity } from './organisation-access-right.entity';
import { ApplicationEntity } from './application.entity';
import { Exclude } from 'class-transformer';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { EncryptedColumn } from '../decorators/encryption.decorator';
import { PrivateSignatureKey, PublicSignatureKey, StringSignatureEncoder } from '@cmts-dev/carmentis-sdk/server';

@ObjectType()
@Entity('organisation')
export class OrganisationEntity {
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

	@Field(type => Boolean)
	@Column({default: false})
	published: boolean;

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
	@Exclude()
	privateSignatureKey: string;

	@Field(type => String)
	@Column()
	publicSignatureKey: string;

	@OneToMany(() => ApplicationEntity, (app) => app.organisation, { cascade: true })
	applications: ApplicationEntity[];

	@Field(type => Date)
	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Field(type => Date)
	@UpdateDateColumn()
	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	lastUpdateAt: Date;

	@OneToMany(() => OrganisationAccessRightEntity, (perm) => perm.organisation, { cascade: true })
	accessRights: OrganisationAccessRightEntity[];

	@Field(type => Int)
	@Column({default: 0})
	version: number;

	@Field(type => String, {nullable: true})
	@Column({nullable: true})
	virtualBlockchainId: string;

	getPrivateSignatureKey(): PrivateSignatureKey {
		const encoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		return encoder.decodePrivateKey(this.privateSignatureKey);
	}

	getPublicSignatureKey(): PublicSignatureKey {
		const encoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		return encoder.decodePublicKey(this.publicSignatureKey);
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
}