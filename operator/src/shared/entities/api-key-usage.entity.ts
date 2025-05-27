import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { ApplicationEntity } from './application.entity';
import { ApiKeyEntity } from './api-key.entity';
import { AutoMap } from '@automapper/classes';

@Entity('api-key-usage')
export class ApiKeyUsageEntity {
	@AutoMap()
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => ApiKeyEntity, (key) => key.usages, { onDelete: "CASCADE" })
	apiKey: ApiKeyEntity;

	@AutoMap()
	@Column({nullable: true})
	ip: string;

	@AutoMap()
	@CreateDateColumn()
	usedAt: Date;

	@AutoMap()
	@Column()
	requestUrl: string;

	@AutoMap()
	@Column()
	requestMethod: string;

	@AutoMap()
	@Column()
	responseStatus: number;

}