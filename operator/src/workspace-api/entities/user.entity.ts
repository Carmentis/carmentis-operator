import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { OrganisationEntity } from './organisation.entity';
import { OrganisationAccessRightEntity } from './organisation-access-right.entity';

@Entity('user')
export class UserEntity {
	@PrimaryColumn()
	publicKey: string;

	@Column()
	firstname: string;

	@Column()
	lastname: string;

	@Column({ default: false })
	isAdmin: boolean;

	@OneToMany(_ => OrganisationEntity, (org) => org.owner)
	ownedOrganisations: OrganisationEntity[];

	@OneToMany(_ => OrganisationAccessRightEntity, (perm) => perm.user)
	accessRights: OrganisationAccessRightEntity[];
}