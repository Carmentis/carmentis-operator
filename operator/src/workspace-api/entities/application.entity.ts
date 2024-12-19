import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {OrganisationEntity} from "./organisation.entity";

@Entity("application")
export class ApplicationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

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


    @Column()
    structure: string = "{}";


}