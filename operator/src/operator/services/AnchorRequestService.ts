import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationEntity } from '../../shared/entities/ApplicationEntity';
import { Repository } from 'typeorm';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';
import { AnchorDto, AnchorWithWalletDto } from '../dto/AnchorDto';
import { CMTSToken, EncoderFactory, Hash, Microblock, Utils } from '@cmts-dev/carmentis-sdk/server';
import { randomBytes } from 'crypto';
import { OrganisationEntity } from '../../shared/entities/OrganisationEntity';

@Injectable()
export class AnchorRequestService {

	private logger = new Logger(AnchorRequestService.name)
	constructor(
		@InjectRepository(AnchorRequestEntity)
		private readonly anchorRequestRepository: Repository<AnchorRequestEntity>,
	) {}


	async storeAnchorRequest(organisation: OrganisationEntity, application: ApplicationEntity, request: AnchorWithWalletDto): Promise<AnchorRequestEntity> {
		const anchorRequestId = this.generateRandomAnchorRequestId();

		await this.anchorRequestRepository.save({
			anchorRequestId: anchorRequestId,
			status: 'pending',
			request,
			localOrganisationId: organisation.id,
			applicationId: application.id,
		});
		return this.findAnchorRequestByAnchorRequestId(anchorRequestId);
	}

	/**
	 * Finds an AnchorRequestEntity by its unique anchor request ID.
	 *
	 * @param {string} anchorRequestID - The unique identifier of the anchor request to find.
	 * @return {Promise<AnchorRequestEntity>} A promise that resolves to the AnchorRequestEntity matching the given ID, or rejects if no match is found.
	 */
	async findAnchorRequestByAnchorRequestId(anchorRequestID: string): Promise<AnchorRequestEntity> {
		const storedAnchorRequest = await this.anchorRequestRepository.findOneByOrFail({
			anchorRequestId: anchorRequestID,
		})
		this.logger.log(`Anchor request found for id ${anchorRequestID}:`)
		return storedAnchorRequest;
	}

	/**
	 * Marks an anchor request as published by updating its status and associated details.
	 *
	 * @param {string} anchorRequestId - The unique identifier of the anchor request to be marked as published.
	 * @param {Hash} vbId - The virtual blockchain identifier.
	 * @param {Hash} mbHash - The microblock hash.
	 * @return {Promise<void>} A promise that resolves when the operation is complete.
	 */
	markAnchorRequestAsPublished(anchorRequestId: string, vbId: Hash, mbHash: Hash) {
		this.anchorRequestRepository.update({
			anchorRequestId
		}, {
			status: 'completed',
			publishedMicroBlockHash: mbHash.encode(),
			publishedAt: Date.now(),
		})
	}

	private generateRandomAnchorRequestId() {
		const hexEncoder = EncoderFactory.defaultBytesToStringEncoder();
		return hexEncoder.encode(randomBytes(32))
	}


	async createAndSaveCompletedAnchorRequest(virtualBlockId: Hash, microBlockHash: Hash, anchorDto: AnchorDto, organisation: OrganisationEntity, application: ApplicationEntity) {
		const anchorRequestId = this.generateRandomAnchorRequestId();
		return await this.anchorRequestRepository.save({
			anchorRequestId: anchorRequestId,
			status: 'completed',
			request: anchorDto,
			localOrganisationId: organisation.getId(),
			applicationId: application.getId(),
			virtualBlockchainId: virtualBlockId.encode(),
			publishedMicroBlockHash: microBlockHash.encode(),
			publishedAt: Date.now(),
		});
	}

	async saveMicroblock(anchorRequestId: string, mb: Microblock) {
		const {microblockData: serializedMb} = mb.serialize();
		await this.anchorRequestRepository.update({
			anchorRequestId
		}, {
			hexEncodedBuiltMicroblock: Utils.binaryToHexa(serializedMb)
		})
	}


	async saveGenesisSeed(anchorRequestId: any, genesisSeed: Hash) {
		await this.anchorRequestRepository.update({
			anchorRequestId
		}, {
			hexEncodedGenesisSeed: Utils.binaryToHexa(genesisSeed.toBytes())
		})
	}

	async getAllAnchorRequests() {
		return await this.anchorRequestRepository.find();
	}

	async getAnchorRequestByAnchorRequestId(anchorRequestId: string) {
		return await this.anchorRequestRepository.findOneBy({anchorRequestId});
	}

	async deleteAnchorRequestByAnchorRequestId(anchorRequestId: string) {
		return await this.anchorRequestRepository.delete({anchorRequestId});
	}
}