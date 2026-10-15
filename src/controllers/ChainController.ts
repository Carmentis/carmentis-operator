import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MicroblockUtils } from '../utils/MicroblockUtils';
import { ProviderFactory } from '@cmts-dev/carmentis-sdk-core';
import { API_V1 } from '../api/ApiVersion';
import { IndexerService } from '../indexer/IndexerService';

@ApiTags('Chain')
@Controller({ path: 'chain', version: API_V1 })
export class ChainController {
	private readonly logger = new Logger();

	constructor(
		private readonly indexerService: IndexerService
	) {
	}

	@ApiOperation({
		summary: 'Check if a microblock is published on blockchain',
		description: 'Verifies if a specific microblock has been published on the blockchain.'
	})
	@ApiResponse({
		status: 200,
		description: 'The publication status of the microblock.',
		schema: {
			properties: {
				isPublished: { type: 'boolean' }
			}
		}
	})
	@Get('/microblock/:microblockHash/published')
	async isMicroblockPublishedOnBlockchain(
		@Param('microblockHash') microblockHash: string,
		@Query('nodeEndpoint') nodeEndpoint: string,
		@Query('indexerEndpoint') indexerEndpoint: string,
	) {
		if (nodeEndpoint) {
			const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(nodeEndpoint);
			try {
				await provider.loadMicroblockByMicroblockHash(
					MicroblockUtils.decodeMicroblockHash(microblockHash)
				);
				return { isPublished: true };
			} catch (e) {
				return { isPublished: false };
			}
		} else if (indexerEndpoint) {
			const indexer = this.indexerService.forEndpoint(indexerEndpoint);
			try {
				const res = await indexer.findMicroblockByHash(
					microblockHash
				);
				return { isPublished: res !== null };
			} catch (e) {
				return { isPublished: false };
			}
		} else {
			throw new Error('No node or indexer endpoint provided');
		}
	}
}
