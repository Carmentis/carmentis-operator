import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationEntity } from '../../shared/entities/application.entity';
import { Repository } from 'typeorm';
import { AnchorRequestEntity } from '../entities/anchor-request.entity';
import { AnchorDto, AnchorWithWalletDto } from '../dto/Anchor.dto';
import { EncoderFactory, Hash } from '@cmts-dev/carmentis-sdk/server';
import { randomBytes } from 'crypto';
import { OrganisationEntity } from '../../shared/entities/organisation.entity';

@Injectable()
export class AnchorRequestService {
	constructor(
		@InjectRepository(AnchorRequestEntity)
		private readonly anchorRequestRepository: Repository<AnchorRequestEntity>,
	) {}

	/**
	 * Stores an anchor request with the specified organisation, application, and request data.
	 *
	 * @param {OrganisationEntity} organisation - The organisation entity associated with the anchor request.
	 **/
	async storeAnchorRequest(organisation: OrganisationEntity, application: ApplicationEntity, request: AnchorWithWalletDto): Promise<AnchorRequestEntity> {
		const anchorRequestId = this.generateRandomAnchorRequestId();
		return this.anchorRequestRepository.save({
			anchorRequestId: anchorRequestId,
			status: 'pending',
			request,
			organisationId: organisation.id,
			applicationId: application.id,
		})
	}

	/**
	 * Finds an AnchorRequestEntity by its unique anchor request ID.
	 *
	 * @param {string} anchorRequestID - The unique identifier of the anchor request to find.
	 * @return {Promise<AnchorRequestEntity>} A promise that resolves to the AnchorRequestEntity matching the given ID, or rejects if no match is found.
	 */
	async findAnchorRequestByAnchorRequestId(anchorRequestID: string): Promise<AnchorRequestEntity> {
		return this.anchorRequestRepository.findOneByOrFail({
			anchorRequestId: anchorRequestID,
		})
	}

	/**
	 * Marks an anchor request as published by updating its status and associated details.
	 *
	 * @param {string} anchorRequestId - The unique identifier of the anchor request to be marked as published.
	 * @param {Hash} vbId - The virtual blockchain identifier.
	 * @param {Hash} mbHash - The microblock hash.
	 * @return {Promise<void>} A promise that resolves when the operation is complete.
	 */
	async markAnchorRequestAsPublished(anchorRequestId: string, vbId: Hash, mbHash: Hash) {
		this.anchorRequestRepository.update({
			anchorRequestId
		}, {
			status: 'completed',
			virtualBlockchainId: vbId.encode(),
			microBlockHash: mbHash.encode()
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
			organisationId: organisation.getId(),
			applicationId: application.getId(),
			virtualBlockchainId: virtualBlockId.encode(),
			microBlockHash: microBlockHash.encode()
		});
	}
}