import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApplicationEntity } from './application.entity';
import { ApiKeyUsageEntity } from './api-key-usage.entity';
import { AutoMap } from '@automapper/classes';
import { EncryptedColumn } from '../decorators/encryption.decorator';

@Entity('api-key')
export class ApiKeyEntity {
	@AutoMap()
	@PrimaryGeneratedColumn()
	id: number;

	@AutoMap()
	@Column()
	name: string;

	@AutoMap()
	@Column()
	uid: string;

	@Exclude()
	@EncryptedColumn()
	key: string;

	@ManyToOne(() => ApplicationEntity, app => app.apiKeys, { onDelete: "CASCADE" })
	application: ApplicationEntity;

	@AutoMap()
	@CreateDateColumn()
	createdAt: Date;

	@AutoMap()
	@Column({ nullable: true })
	activeUntil: Date;

	@AutoMap()
	@Column({default: true})
	isActive: boolean;

	@AutoMap()
	@OneToMany(() => ApiKeyUsageEntity, (usage) => usage.apiKey, { cascade: true })
	usages: ApiKeyUsageEntity[];
}