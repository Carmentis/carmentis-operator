import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { AnchorWithWalletDto } from '../dto/AnchorDto';
import { CMTSToken, Optional } from '@cmts-dev/carmentis-sdk/server';

@Entity()
export class AnchorRequestEntity {

	@PrimaryColumn()
	anchorRequestId: string;

	@Column()
	status: 'pending' | 'completed' | 'failed' = 'pending';

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;



	@Column()
	organisationId: number;

	@Column({nullable: true})
	virtualBlockchainId?: string;

	@Column({nullable: true})
	microBlockHash?: string;

	/**
	 * This application id refers to the local id of the application, not the hash of the application on the chain.
	 */
	@Column()
	applicationId: number;


	@Column({ type: 'json' })
	request: AnchorWithWalletDto;

	@Column()
	gasPriceInAtomic: number;

	getAnchorRequestId(): string {
		return this.anchorRequestId;
	}

	isPending(): boolean {
		return this.status === 'pending';
	}

	isCompleted(): boolean {
		return this.status === 'completed';
	}

	isPublished(): boolean {
		return this.virtualBlockchainId !== undefined;
	}

	getVirtualBlockchainId(): Optional<string> {
		return Optional.of(this.virtualBlockchainId);
	}

	getMicroBlockHash(): Optional<string> {
		return Optional.of(this.microBlockHash);
	}

	isFailed(): boolean {
		return this.status === 'failed';
	}

	getStatus() {
		return this.status
	}

	getGasPrice(): CMTSToken {
		return CMTSToken.createAtomic(this.gasPriceInAtomic)
	}
}
