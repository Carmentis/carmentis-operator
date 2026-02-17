import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('user')
export class UserEntity extends BaseEntity {

	@PrimaryColumn()
	publicKey: string;

	@Column()
	pseudo: string;
}