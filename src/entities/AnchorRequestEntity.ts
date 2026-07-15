import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { AnchorDto, AnchorWithWalletDto } from '../dto/AnchorDto';
import { EncoderFactory, Hash, IllegalStateError, Microblock, Optional, Utils } from '@cmts-dev/carmentis-sdk-core';
import { Logger } from '@nestjs/common';
import { ApplicationEntity } from './ApplicationEntity';
import { AnchorRequestStatus } from '../utils/AnchorRequestStatus';

@Entity()
export class AnchorRequestEntity {

	private logger = new Logger();

	/**
	 *
	 */
	@PrimaryColumn()
	anchorRequestId: string;


	/**
	 * Status of the anchor request.
	 */
	@Column()
	status: AnchorRequestStatus = AnchorRequestStatus.CREATED;


	/**
	 * Defines the height of the microblock in the virtual blockchain.
	 *
	 * Initially, the microblock does not exist, so the height is necessarily nullable.
	 */
	@Column({nullable: true})
	submittedMicroblockHeight?: number;

	/**
	 * This field is the timestamp when the anchor request was created
	 */
	@Column({ default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;


	/**
	 * This field is the timestamp when the microblock is published
	 */
	@Column({ nullable: true })
	submittedAt: number;

	/**
	 * Initially, the microblock does not exist, so the hash is necessarily nullable.
	 */
	@Column({nullable: true})
	submittedMicroblockHash?: string;

	/**
	 * Initially, the microblock does not exist, so the microblock is necessarily nullable.
	 */
	@Column({nullable: true})
	submittedMicroblock?: string;

	/**
	 * The virtual blockchain id in which the microblock is published.
	 *
	 */
	@Column({nullable: true})
	virtualBlockchainId?: string;

	/**
	 *
	 */
	@ManyToOne(() => ApplicationEntity, app => app.anchorRequests, { onDelete: 'CASCADE' })
	application: ApplicationEntity;


	/**
	 * This fields is here to remember the request.
	 */
	@Column({ type: 'json' })
	receivedAnchorRequest: AnchorWithWalletDto;

	/**
	 * Contains the unsigned hex-encoded microblock that endorser should sign.
	 */
	@Column({ nullable: true })
	microblockAwaitingForSignatureFromEndorser: string;

	/**
	 * This field is used to remember a generated genesis seed.
	 * By default, it is null meaning that no genesis seed was generated (not needed).
	 */
	@Column({nullable: true})
	generatedGenesisSeed?: string;

	/**
	 * Duration in days in which nodes are supposed to remember the microblock.
	 * After this delay, nodes are allowed to forget the microblock.
	 */
	@Column({nullable: true})
	expirationInDays: number;

	getAnchorRequestId(): string {
		return this.anchorRequestId;
	}

	isPending(): boolean {
		return this.status === AnchorRequestStatus.INITIATED;
	}

	isCompleted(): boolean {
		return this.status === AnchorRequestStatus.SUBMITTED;
	}

	getVirtualBlockchainId(): Optional<string> {
		return Optional.of(this.receivedAnchorRequest.virtualBlockchainId);
	}

	getMicroBlockHash(): Optional<string> {
		return Optional.of(this.submittedMicroblockHash);
	}

	isFailed(): boolean {
		return this.status === 'failed';
	}

	getStatus() {
		return this.status
	}

	getBuiltMicroblock(): Optional<Microblock> {
		if (this.microblockAwaitingForSignatureFromEndorser === undefined) return Optional.none();
		this.logger.debug(`Loading built microblock from hex encoded string: ${this.microblockAwaitingForSignatureFromEndorser}`)
		return Optional.of(Microblock.loadFromSerializedMicroblock(Utils.binaryFromHexa(this.microblockAwaitingForSignatureFromEndorser)))
	}

	getStoredGenesisSeed() {
		if (!this.generatedGenesisSeed) throw new IllegalStateError("No genesis seed has been saved")
		return Hash.from(EncoderFactory.bytesToHexEncoder().decode(this.generatedGenesisSeed))
	}
}
