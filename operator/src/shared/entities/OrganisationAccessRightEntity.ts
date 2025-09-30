import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { OrganisationEntity } from './OrganisationEntity';
import { UserEntity } from './UserEntity';

@Entity('organisation-access-right')
@Unique('UQ_organisation_user', ['organisation', 'user'])
export class OrganisationAccessRightEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => OrganisationEntity, (org) => org.accessRights, { onDelete: "CASCADE" })
	organisation: OrganisationEntity;

	@ManyToOne(() => UserEntity, (user) => user.accessRights, { onDelete: "CASCADE" })
	user: UserEntity;

	@Column({ default: false })
	editUsers: boolean;

	@Column({ default: false })
	editApplications: boolean;
}