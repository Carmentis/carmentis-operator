import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {OrganisationEntity} from "./organisation.entity";
import {Transform} from "class-transformer";

export interface ApplicationData {

}

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

    @Column({ nullable: true, default: '' })
    domain: string;

    @Column({ nullable: true, default: '' })
    website: string;

    @Column({ nullable: true })
    virtualBlockchainId: string;

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

    @Column({ default: true })
    isDraft: boolean;

    @Column({ type: 'json'})
    data: {
        fields?: {
            name: string;
            type: number;
            maskId?: string;
        }[];
        structures?: {
            name: string;
            properties: {
                name: string;
                type: number;
                maskId?: string;
            }[];
        }[];
        enumerations?: {
            name: string,
            values: string[]
        }[];
        messages?: {
            name: string,
            content: string,
        }[];
        masks?: {
            name: string;
            regex: string;
            substitution: string;
        }[];
    };
}