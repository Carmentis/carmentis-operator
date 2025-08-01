import { AutoMap } from '@automapper/classes';
import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { OrganisationEntity } from './OrganisationEntity';
import { Hash, Optional } from '@cmts-dev/carmentis-sdk/server';

@ObjectType()
@Entity('node')
export class NodeEntity {
	@Field(type => Number)
	@PrimaryGeneratedColumn()
	id: number;

	/**
	 * A user uses an alias to distinguish more easily between the nodes.
	 */
	@Field()
	@Column()
	nodeAlias: string;

	@Field(type => Date)
	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	includedAt: Date;

	@Field(type => String)
	@Column()
	rpcEndpoint: string;

	@ManyToOne(() => OrganisationEntity, (org) => org.nodes, { onDelete: "CASCADE" })
	organisation: OrganisationEntity;

	@Field(type => String)
	@Column({ nullable: true })
	virtualBlockchainId?: string;

	hasVirtualBlockchainId(): boolean {
		return this.virtualBlockchainId !== undefined;
	}

	getVirtualBlockchainId(): Optional<Hash> {
		if (this.hasVirtualBlockchainId()) {
			return Optional.some(Hash.from(this.virtualBlockchainId))
		} else {
			return Optional.none()
		}
	}


	setVirtualBlockchainId(virtualBlockchainId: Hash) {
		this.virtualBlockchainId = virtualBlockchainId.encode()
	}
}