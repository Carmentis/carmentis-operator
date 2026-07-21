import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MicroblockUtils } from '../utils/MicroblockUtils';
import { Hash, Provider, ProviderFactory } from '@cmts-dev/carmentis-sdk-core';
import { ApplicationLedgerUtils } from '../utils/ApplicationLedgerUtils';

@ApiTags('Chain')
@Controller('/api/chain')
export class ChainController {
	private readonly logger = new Logger();

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



	@Get('/applicationLedger/:vbId/state')
	async getApplicationLedgerState(
		@Param('vbId') vbId: string,
		@Query('nodeEndpoint') nodeEndpoint: string,
	) {
		this.logger.log(`Getting application ledger state for VB ${vbId} from node ${nodeEndpoint}`);
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(nodeEndpoint);
		const vb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.fromHex(vbId));
		return ApplicationLedgerUtils.getActorsAndChannels(vb);
	}

	@Get('/applicationLedger/:vbId/actor/:actorName/pk')
	async getActorKeys(
		@Param('vbId') vbId: string,
		@Param('actorName') actorName: string,
		@Query('nodeEndpoint') nodeEndpoint: string,
	) {
		this.logger.log(`Getting application ledger state for VB ${vbId} from node ${nodeEndpoint}`);
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(nodeEndpoint);
		const vb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.fromHex(vbId));
		return ApplicationLedgerUtils.getActorKeys(vb, actorName);
	}
}