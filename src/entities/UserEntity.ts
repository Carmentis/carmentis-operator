import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('user')
export class UserEntity extends BaseEntity {

	@PrimaryColumn()
	publicKey: string;

	@Column()
	pseudo: string;

	@CreateDateColumn()
	createdAt: Date;
}