import {
	Column,
	Entity,
	JoinColumn,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { OrganisationAccessRightEntity } from './organisation-access-right.entity';
import {ApplicationEntity} from "./application.entity";
import { OracleEntity } from './oracle.entity';
import { Exclude } from 'class-transformer';

@Entity('organisation')
export class OrganisationEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({
		nullable: true,
	})
	logoUrl: string;

	@Column({default: false})
	published: boolean;

	@Column({default: true})
	isDraft: boolean;

	@Column({default: ''})
	city: string;

	@Column({default: ''})
	countryCode: string;

	@Column({default: ''})
	website: string;

	@Column()
	@Exclude()
	privateSignatureKey: string;

	@Column()
	publicSignatureKey: string;

	@OneToMany(() => ApplicationEntity, (app) => app.organisation)
	applications: ApplicationEntity[];

	@OneToMany(() => OracleEntity, (app) => app.organisation)
	oracles: OracleEntity[];


	@ManyToOne(() => UserEntity)
	creator: UserEntity;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column({ default: 0 })
	balance: number;

	@UpdateDateColumn()
	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	lastUpdateAt: Date;

	@OneToMany(() => OrganisationAccessRightEntity, (perm) => perm.organisation)
	accessRights: OrganisationAccessRightEntity[];
}