import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { ApplicationEntity } from './application.entity';
import { ApiKeyUsageEntity } from './api-key-usage.entity';

@Entity('api-key')
export class ApiKeyEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Exclude()
	@Column()
	@Index()
	key: string;

	@ManyToOne(() => ApplicationEntity, app => app.apiKeys)
	application: ApplicationEntity;

	@CreateDateColumn()
	createdAt: Date;

	@Column({ nullable: true })
	activeUntil: Date;

	@Column({default: true})
	isActive: boolean;

	@OneToMany(() => ApiKeyUsageEntity, (usage) => usage.apiKey)
	usages: ApiKeyUsageEntity[];

	@Expose()
	get partialKey(): string {
		return '****' + this.key.slice(-4);
	}
}