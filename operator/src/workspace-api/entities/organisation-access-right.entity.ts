import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { OrganisationEntity } from './organisation.entity';
import { UserEntity } from './user.entity';

@Entity('organisation-access-right')
@Unique('UQ_organisation_user', ['organisation', 'user'])
export class OrganisationAccessRightEntity {
	@PrimaryGeneratedColumn()
	id: number;


	@ManyToOne(() => OrganisationEntity, (org) => org.accessRights)
	organisation: OrganisationEntity;

	@ManyToOne(() => UserEntity, (user) => user.accessRights)
	user: UserEntity;

	@Column({ default: false })
	isAdmin: boolean;

	@Column({ default: false })
	addUser: boolean;

	@Column({ default: false })
	removeUser: boolean;

	@Column({ default: false })
	addAdmin: boolean;

	@Column({ default: false })
	removeAdmin: boolean;

	@Column({ default: false })
	addApplication: boolean;

	@Column({ default: false })
	deleteApplication: boolean;

	@Column({ default: false })
	addOracle: boolean;

	@Column({ default: false })
	removeOracle: boolean;

	@Column({ default: false })
	canPublish: boolean;
}