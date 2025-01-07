import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {OrganisationEntity} from "./organisation.entity";
import {Transform} from "class-transformer";

@Entity("application")
export class ApplicationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: () => '1' })
    version: number;

    @Column({ nullable: true })
    logoUrl: string;

    @Column({ nullable: true })
    domain: string;

    @Column({ nullable: true })
    website: string;

    @ManyToOne(() => OrganisationEntity, (org) => org.applications)
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

    @Column({ default: false })
    hasBeenModified: boolean;

    @Column()
    @Transform(({value}) => JSON.parse(value), { toPlainOnly: true })
    data: string = "{}";
}