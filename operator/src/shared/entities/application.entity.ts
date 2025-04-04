import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrganisationEntity } from './organisation.entity';
import { ApplicationDataType } from '../../workspace-api/types/application-data.type';
import { ApiKeyEntity } from './api-key.entity';


@Entity("application")
export class ApplicationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: () => '0' })
    version: number;

    @Column({ nullable: true, default: '' })
    logoUrl: string;

    @Column({nullable: true})
    tag: string;

    @Column({ default: '', type: "text" })
    description: string;

    @Column({ nullable: true, default: '' })
    domain: string;

    @Column({ nullable: true, default: '' })
    website: string;

    @Column({ nullable: true, unique: true })
    virtualBlockchainId: string;

    @ManyToOne(() => OrganisationEntity, (org) => org.applications, { onDelete: "CASCADE" })
    organisation: OrganisationEntity;

    @UpdateDateColumn()
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdateAt: Date;


    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;


    @Column({ default: false })
    published: boolean;

    @Column({ nullable: true })
    publishedAt: Date;

    @Column({ default: true })
    isDraft: boolean;

    @OneToMany(() => ApiKeyEntity, (key) => key.application, { cascade: true })
    apiKeys: ApiKeyEntity[];


}