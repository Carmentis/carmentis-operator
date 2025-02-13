import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrganisationEntity } from './organisation.entity';
import { OracleDataType } from '../../workspace-api/types/oracle-data.type';

@Entity('oracle')
export class OracleEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({ default: () => '0' })
	version: number;

	@Column({ nullable: true })
	logoUrl: string;

	@Column({ nullable: true })
	domain: string;

	@ManyToOne(() => OrganisationEntity, (org) => org.oracles)
	organisation: OrganisationEntity;

	@UpdateDateColumn()
	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	lastUpdateAt: Date;


	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;


	@Column({ default: false })
	published: boolean;

	@Column({ default: true })
	isDraft: boolean;

	@Column({ nullable: true })
	publishedAt: Date;

	@Column({type: 'json', default: {}})
	data: OracleDataType;

	@Column({nullable: true})
	virtualBlockchainId: string;
}