import { Controller, Get } from '@nestjs/common';

@Controller('/api/proof')
export class ProofController {

	@Get('/anchor')
	async getProofOfAnchor() {

	}

}