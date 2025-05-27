import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrganisationEntity } from './organisation.entity';
import { ApiKeyEntity } from './api-key.entity';
import { AutoMap } from '@automapper/classes';
import { ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity("application")
export class ApplicationEntity {
    @AutoMap()
    @PrimaryGeneratedColumn()
    id: number;

    @AutoMap()
    @Column()
    name: string;

    @AutoMap()
    @Column({ default: () => '0' })
    version: number;

    @AutoMap()
    @Column({ nullable: true, default: '' })
    logoUrl: string;

    @AutoMap()
    @Column({ default: '', type: "text" })
    description: string;

    @AutoMap()
    @Column({ nullable: true, default: '' })
    domain: string;

    @AutoMap()
    @Column({ nullable: true, default: '' })
    website: string;

    @AutoMap()
    @Column({ nullable: true, unique: true })
    virtualBlockchainId: string;

    @ManyToOne(() => OrganisationEntity, (org) => org.applications, { onDelete: "CASCADE" })
    organisation: OrganisationEntity;

    @AutoMap()
    @UpdateDateColumn()
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdateAt: Date;

    @AutoMap()
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @AutoMap()
    @Column({ default: false })
    published: boolean;

    @AutoMap()
    @Column({ nullable: true })
    publishedAt: Date;

    @AutoMap()
    @Column({ default: true })
    isDraft: boolean;

    @OneToMany(() => ApiKeyEntity, (key) => key.application, { cascade: true })
    apiKeys: ApiKeyEntity[];
}