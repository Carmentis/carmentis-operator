import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { OrganisationAccessRightEntity } from './organisation-access-right.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('user')
export class UserEntity {

	@Field(type => String)
	@PrimaryColumn()
	publicKey: string;

	@Field(type => String)
	@Column()
	firstname: string;

	@Field(type => String)
	@Column()
	lastname: string;

	@Field(type => Boolean)
	@Column({ default: false })
	isAdmin: boolean;

	@OneToMany(_ => OrganisationAccessRightEntity, (perm) => perm.user, { cascade: true })
	accessRights: OrganisationAccessRightEntity[];
}