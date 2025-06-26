import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationEntity } from '../../shared/entities/application.entity';
import { Repository } from 'typeorm';
import { AnchorRequestEntity } from '../entities/anchor-request.entity';
import { AnchorWithWalletDto } from '../dto/anchor.dto';
import { EncoderFactory } from '@cmts-dev/carmentis-sdk/server';
import { randomBytes } from 'crypto';
import { OrganisationEntity } from '../../shared/entities/organisation.entity';

@Injectable()
export class AnchorRequestService {
	constructor(
		@InjectRepository(AnchorRequestEntity)
		private readonly anchorRequestRepository: Repository<AnchorRequestEntity>,
	) {}

	async storeAnchorRequest(organisation: OrganisationEntity, request: AnchorWithWalletDto): Promise<AnchorRequestEntity> {
		const dataId = this.generateRandomDataId();
		return this.anchorRequestRepository.save({
			dataId,
			status: 'pending',
			request,
			organisationId: organisation.id,
		})
	}

	async findAnchorRequestByDataId(dataId: string): Promise<AnchorRequestEntity> {
		return this.anchorRequestRepository.findOneByOrFail({
			dataId,
		})
	}

	private generateRandomDataId() {
		const hexEncoder = EncoderFactory.bytesToHexEncoder();
		return hexEncoder.encode(randomBytes(32))
	}

}