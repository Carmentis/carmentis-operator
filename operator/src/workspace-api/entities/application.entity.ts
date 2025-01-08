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

    @Column({ default: true })
    isDraft: boolean;

    @Column({ type: 'json'})
    data: {
        fields?: {
            name: string;
            hashable: boolean;
            visiblity: string;
            type: string
            isList: boolean;
            required: boolean;
        }[];
        structures?: {
            name: string;
            fields: {
                name: string;
                hashable: boolean;
                visiblity: string;
                type: string
                isList: boolean;
                required: boolean;
            }[];
        }[];
        enumerations?: {
            name: string,
            values: { id: number, value: string }[]
        }[];
        messages?: {
            name: string,
            message: string,
        }[];
        masks?: {
            name: string;
            expression: string;
            substitution: string;
        }[];
    };
}