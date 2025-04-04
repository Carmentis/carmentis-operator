import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
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

	@OneToMany(_ => OrganisationAccessRightEntity, (perm) => perm.user, { cascade: true })
	accessRights: OrganisationAccessRightEntity[];
}