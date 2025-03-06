import { Public } from '../decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';
import * as sdk from '../../../../../carmentis-core';
import { EnvService } from '../../shared/services/env.service';

@Controller('/workspace/api/chain')
export class ChainController {


	constructor(
		private readonly envService: EnvService,
	) {}


	@Public()
	@Get("/oracles")
	async getSupportedOracles() {
		sdk.blockchain.blockchainCore.setNode(this.envService.nodeUrl)
		const oraclesHash = await sdk.blockchain.blockchainQuery.getOracles();
		const results = []
		for (const hash of oraclesHash) {
			const vb = new sdk.blockchain.oracleVb(hash);
			await vb.load();
			const description = await vb.getDescription();
			const name = description.name;
			const height = vb.getHeight();
			for (let i = 1; i < height; i++) {
				const definition = await vb.getDefinition(i);
				for (const service of definition.services) {
					results.push({
						oracleName: name,
						hash,
						version: i,
						serviceName: service.name,
					})
				}
			}
		}
		return results
	}
}