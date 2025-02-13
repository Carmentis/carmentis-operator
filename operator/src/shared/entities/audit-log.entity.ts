import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

export enum AuditOperation {
	USER_CREATION = 'USER_CREATION',
	USER_DELETION = 'USER_DELETION',
	ORGANISATION_CREATION = 'ORGANISATION_CREATION',
	ORGANISATION_DELETION = 'ORGANISATION_DELETION',
	ORGANISATION_EDITION = 'ORGANISATION_EDITION',
	ORGANISATION_USER_INSERTION = 'ORGANISATION_USER_INSERTION',
	ORGANISATION_USER_DELETION = 'ORGANISATION_USER_DELETION',
	APPLICATION_CREATION = 'APPLICATION_CREATION',
	APPLICATION_DELETION = 'APPLICATION_DELETION',
	APPLICATION_EDITION = 'APPLICATION_EDITION',
	ORACLE_CREATION = 'ORACLE_CREATION',
	ORACLE_DELETION = 'ORACLE_DELETION',
	ORACLE_EDITION = 'ORACLE_EDITION',
}

export enum EntityType {
	USER = 'USER',
	ORGANISATION = 'ORGANISATION',
	APPLICATION = 'APPLICATION',
	ORACLE = 'ORACLE',
}

@Entity('audit_log')
export class AuditLogEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'json', nullable: true })
	data: string;

	@Column({ type: 'enum', enum: EntityType })
	entityType: EntityType;

	@Column({ nullable: true })
	relatedOrganisationId: number;


	@Column({ type: 'enum', enum: AuditOperation })
	operation: AuditOperation;

	@CreateDateColumn()
	timestamp: Date;

	@ManyToOne(() => UserEntity, { nullable: true })
	performedBy: UserEntity;
}
