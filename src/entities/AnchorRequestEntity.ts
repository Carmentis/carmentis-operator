import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
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
import { ApplicationEntity } from './ApplicationEntity';

@Entity()
export class AnchorRequestEntity {

	private logger = new Logger();

	@PrimaryColumn()
	anchorRequestId: string;

	@Column()
	status: 'pending' | 'completed' | 'failed' = 'pending';


	/**
	 * This field is the timestamp when the anchor request was created
	 */
	@Column({ default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;


	/**
	 * This field is the timestamp when the microblock is published
	 */
	@Column({ nullable: true })
	publishedAt: Date;

	@Column({nullable: true})
	publishedMicroBlockHash?: string;

	@Column({nullable: true})
	virtualBlockchainId?: string;

	@ManyToOne(() => ApplicationEntity, app => app.anchorRequests, { onDelete: 'CASCADE' })
	application: ApplicationEntity;


	@Column({ type: 'json' })
	request: AnchorWithWalletDto;

	@Column({ nullable: true })
	hexEncodedBuiltMicroblock: string;

	@Column({nullable: true})
	hexEncodedGenesisSeed?: string;

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
		return Optional.of(this.publishedMicroBlockHash);
	}

	isFailed(): boolean {
		return this.status === 'failed';
	}

	getStatus() {
		return this.status
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
