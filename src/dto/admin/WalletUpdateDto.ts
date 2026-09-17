import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Only the fields that are actually safe to change after a wallet has been created.
 * `seed`, `signatureSchemeId` and `publicKeyEncryptionSchemeId` are intentionally absent:
 * the seed is the wallet's cryptographic identity and the two scheme ids are fixed at
 * creation time to match it — none of them make sense to edit afterwards.
 */
export class WalletUpdateDto {
	@ApiPropertyOptional({ description: 'Human-readable name for the wallet' })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	name?: string;

	@ApiPropertyOptional({ description: 'RPC endpoint URL for blockchain interactions' })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	rpcEndpoint?: string;

	@ApiPropertyOptional({ description: 'Indexer endpoint URL for blockchain data queries' })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	indexerEndpoint?: string;

	@ApiPropertyOptional({ description: 'Regular expression pattern to restrict allowed endpoints' })
	@IsOptional()
	@IsString()
	allowedEndpointsRegex?: string;
}
