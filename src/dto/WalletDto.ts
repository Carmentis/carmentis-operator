import { ApiProperty } from '@nestjs/swagger';

/** Public view of a wallet: secrets (seed, actor passphrase) are never exposed. */
export class WalletDto {
	@ApiProperty({ description: 'The identifier of the wallet.', format: 'uuid' })
	id: string;

	@ApiProperty()
	name: string;

	@ApiProperty({ description: 'The RPC endpoint of the node used by the wallet.' })
	rpcEndpoint: string;

	@ApiProperty({ description: 'The indexer endpoint used by the wallet.' })
	indexerEndpoint: string;

	@ApiProperty({ description: 'Creation date of the wallet.' })
	createdAt: Date;
}
