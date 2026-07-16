import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MicroblockUtils } from '../utils/MicroblockUtils';
import { Provider, ProviderFactory } from '@cmts-dev/carmentis-sdk-core';

@ApiTags('Chain')
@Controller('/api/chain')
export class ChainController {
	@ApiOperation({
		summary: 'Check if a microblock is published on blockchain',
		description: 'Verifies if a specific microblock has been published on the blockchain by querying the provided node endpoint.'
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
	) {
		if (!nodeEndpoint) {
			throw new Error('Node endpoint is required');
		}

		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(nodeEndpoint);
		try {
			await provider.loadMicroblockByMicroblockHash(
				MicroblockUtils.decodeMicroblockHash(microblockHash)
			);
			return { isPublished: true };
		} catch (e) {
			return { isPublished: false };
		}
	}
}