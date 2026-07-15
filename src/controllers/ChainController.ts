import { Controller, Get, Param, Query } from '@nestjs/common';
import { MicroblockUtils } from '../utils/MicroblockUtils';
import { Provider, ProviderFactory } from '@cmts-dev/carmentis-sdk-core';

@Controller('/api/chain')
export class ChainController {
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