import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserCredentialEntity } from './UserCredentialEntity';

@Entity('user')
export class UserEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	pseudo: string;

	@Column({ unique: true, nullable: true })
	email?: string;

	@OneToMany(() => UserCredentialEntity, (credential) => credential.user)
	credentials: UserCredentialEntity[];

	@CreateDateColumn()
	createdAt: Date;
}
