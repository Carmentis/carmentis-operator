import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { OrganisationEntity } from './organisation.entity';
import { UserEntity } from './user.entity';

@Entity('organisation-access-right')
@Unique('UQ_organisation_user', ['organisation', 'user'])
export class OrganisationAccessRightEntity {
	@PrimaryGeneratedColumn()
	id: number;


	@ManyToOne(() => OrganisationEntity, (org) => org.accessRights, { onDelete: "CASCADE" })
	organisation: OrganisationEntity;

	@ManyToOne(() => UserEntity, (user) => user.accessRights, { onDelete: "CASCADE" })
	user: UserEntity;

	@Column({ default: false })
	isAdmin: boolean;

	@Column({ default: false })
	editUsers: boolean;

	@Column({ default: false })
	editApplications: boolean;

	@Column({ default: false })
	editOracles: boolean;
}