import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { AnchorWithWalletDto } from '../dto/AnchorDto';
import {
	CMTSToken,
	EncoderFactory,
	Hash,
	IllegalStateError,
	Microblock,
	Optional,
	Utils,
} from '@cmts-dev/carmentis-sdk/server';
import { Logger } from '@nestjs/common';

@Entity()
export class AnchorRequestEntity {

	private logger = new Logger();

	@PrimaryColumn()
	anchorRequestId: string;

	@Column()
	status: 'pending' | 'completed' | 'failed' = 'pending';

	@Column({ default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;



	@Column()
	localOrganisationId: number;

	@Column({nullable: true})
	microBlockHash?: string;

	/**
	 * This application id refers to the local id of the application, not the hash of the application on the chain.
	 */
	@Column()
	applicationId: number;


	@Column({ type: 'json' })
	request: AnchorWithWalletDto;

	@Column({ nullable: true })
	hexEncodedBuiltMicroblock: string;

	@Column({nullable: true})
	hexEncodedGenesisSeed?: string;

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

	getVirtualBlockchainId(): Optional<string> {
		return Optional.of(this.request.virtualBlockchainId);
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

	getBuiltMicroblock(): Optional<Microblock> {
		if (this.hexEncodedBuiltMicroblock === undefined) return Optional.none();
		this.logger.debug(`Loading built microblock from hex encoded string: ${this.hexEncodedBuiltMicroblock}`)
		return Optional.of(Microblock.loadFromSerializedMicroblock(Utils.binaryFromHexa(this.hexEncodedBuiltMicroblock)))
	}

	getStoredGenesisSeed() {
		if (!this.hexEncodedGenesisSeed) throw new IllegalStateError("No genesis seed has been saved")
		return Hash.from(EncoderFactory.bytesToHexEncoder().decode(this.hexEncodedGenesisSeed))
	}
}
