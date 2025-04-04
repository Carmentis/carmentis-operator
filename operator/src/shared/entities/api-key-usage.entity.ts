import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { ApplicationEntity } from './application.entity';
import { ApiKeyEntity } from './api-key.entity';

@Entity('api-key-usage')
export class ApiKeyUsageEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => ApiKeyEntity, (key) => key.usages)
	apiKey: ApiKeyEntity;

	@Column({nullable: true})
	ip: string;

	@CreateDateColumn()
	usedAt: Date;

	@Column()
	requestUrl: string;

	@Column()
	requestMethod: string;

	@Column()
	responseStatus: number;

}