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

	@Column({nullable: true})
	publishedAt: Date;

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

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@UpdateDateColumn()
	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	lastUpdateAt: Date;

	@OneToMany(() => OrganisationAccessRightEntity, (perm) => perm.organisation)
	accessRights: OrganisationAccessRightEntity[];

	@Column({default: 0})
	version: number;

	@Column({default: false})
	isSandbox: boolean;
	
	@Column({nullable: true})
	virtualBlockchainId: string;
}