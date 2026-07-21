import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';
import { AnchorDto, AnchorWithWalletDto } from '../dto/AnchorDto';
import { EncoderFactory, Hash, Microblock, Utils } from '@cmts-dev/carmentis-sdk-core';
import { randomBytes } from 'crypto';
import { ApplicationEntity } from '../entities/ApplicationEntity';
import { AnchorRequestStatus } from '../utils/AnchorRequestStatus';
import { MicroblockUtils } from '../utils/MicroblockUtils';

@Injectable()
export class AnchorRequestService {


	private logger = new Logger(AnchorRequestService.name)
	constructor(
		@InjectRepository(AnchorRequestEntity)
		private readonly anchorRequestRepository: Repository<AnchorRequestEntity>,
	) {}


	// -------------------------------------------------------------------------
	private generateRandomAnchorRequestId() {
		const hexEncoder = EncoderFactory.defaultBytesToStringEncoder();
		return hexEncoder.encode(randomBytes(32))
	}


	/**
	 * Creates an anchor request with a status CREATED.
	 * @param application
	 * @param request
	 */
	async createAnchorRequest(application: ApplicationEntity, request: AnchorDto) {
		const anchorRequestId = this.generateRandomAnchorRequestId();
		const anchorRequestEntity = AnchorRequestEntity.create()
		anchorRequestEntity.anchorRequestId = anchorRequestId;
		anchorRequestEntity.status = AnchorRequestStatus.CREATED;
		anchorRequestEntity.receivedAnchorRequest = request as any
		anchorRequestEntity.application = application
		// if virtual blockchain expiration provided
		if (request.chainStorageInDays) {
			anchorRequestEntity.virtualBlockchainExpiration = Utils.addDaysToTimestamp(
				Utils.getTimestampInSeconds(),
				request.chainStorageInDays
			)
		}
		await anchorRequestEntity.save();
		return anchorRequestId;
	}

	async addBuiltMicroblockToAnchorRequest(anchorRequestId: string, vbId: Hash, builtMicroblock: Microblock) {
		const anchorRequest = await this.findOneByAnchorRequestId(anchorRequestId);
		anchorRequest.status = AnchorRequestStatus.INITIATED
		anchorRequest.microblockAwaitingForSignatureFromEndorser = MicroblockUtils.encodeMicroblock(builtMicroblock);
		anchorRequest.virtualBlockchainId = vbId.encode();
		await this.anchorRequestRepository.save(anchorRequest);
	}


	async addSubmittedMicroblockToAnchorRequest(anchorRequestId: string, vbId: Hash, submittedMicroblock: Microblock) {
		const anchorRequest = await this.findOneByAnchorRequestId(anchorRequestId);
		anchorRequest.submittedMicroblock = MicroblockUtils.encodeMicroblock(submittedMicroblock);
		anchorRequest.status = AnchorRequestStatus.SUBMITTED;
		anchorRequest.submittedMicroblockHeight = submittedMicroblock.getHeight();
		anchorRequest.submittedMicroblockHash = submittedMicroblock.getHash().encode();
		anchorRequest.submittedAt = Date.now();
		anchorRequest.virtualBlockchainId = vbId.encode();
		await this.anchorRequestRepository.save(anchorRequest);
	}

	async cancelAnchorRequestByAnchorRequestId(anchorRequestId: string) {
		const anchorRequest = await this.findOneByAnchorRequestId(anchorRequestId);
		anchorRequest.status = AnchorRequestStatus.CANCELLED;
		await this.anchorRequestRepository.save(anchorRequest);
	}

	/**
	 * Finds an AnchorRequestEntity by its unique anchor request ID.
	 *
	 * @param {string} anchorRequestID - The unique identifier of the anchor request to find.
	 * @return {Promise<AnchorRequestEntity>} A promise that resolves to the AnchorRequestEntity matching the given ID, or rejects if no match is found.
	 */
	async findOneByAnchorRequestId(anchorRequestID: string): Promise<AnchorRequestEntity> {
		const storedAnchorRequest = await this.anchorRequestRepository.findOneOrFail({
			where: {
				anchorRequestId: anchorRequestID,
			},
			relations: ['application']
		})
		this.logger.log(`Anchor request found for id ${anchorRequestID}:`)
		return storedAnchorRequest;
	}

	async getAllAnchorRequests(offset?: number, limit?: number) {
		return await this.anchorRequestRepository.find({
			relations: ['application'],
			skip: offset,
			take: limit
		});
	}

	async deleteAnchorRequestByAnchorRequestId(anchorRequestId: string) {
		return await this.anchorRequestRepository.delete({anchorRequestId});
	}



	// -------------------------------------------------------------------------






	async storeAnchorRequest(application: ApplicationEntity, request: AnchorWithWalletDto): Promise<AnchorRequestEntity> {
		const anchorRequestId = this.generateRandomAnchorRequestId();
		await this.anchorRequestRepository.save({
			anchorRequestId: anchorRequestId,
			status: AnchorRequestStatus.CREATED,
			request,
			application,
			expirationDay: Utils.addDaysToTimestamp(Utils.getTimestampInSeconds(), request.chainStorageInDays ?? 10)
		});
		return this.findOneByAnchorRequestId(anchorRequestId);
	}


	async saveMicroblock(anchorRequestId: string, mb: Microblock) {
		const {microblockData: serializedMb} = mb.serialize();
		await this.anchorRequestRepository.update({
			anchorRequestId
		}, {
			microblockAwaitingForSignatureFromEndorser: Utils.binaryToHexa(serializedMb)
		})
	}


	async saveGenesisSeed(anchorRequestId: any, genesisSeed: Hash) {
		await this.anchorRequestRepository.update({
			anchorRequestId
		}, {
			generatedGenesisSeed: Utils.binaryToHexa(genesisSeed.toBytes())
		})
	}



	async getAnchorRequestByAnchorRequestId(anchorRequestId: string) {
		return await this.anchorRequestRepository.findOne({
			where: {anchorRequestId},
			relations: ['application']
		});
	}


}