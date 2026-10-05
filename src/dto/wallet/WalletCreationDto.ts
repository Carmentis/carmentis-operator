import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class WalletCreationDto {
	@ApiProperty({ description: 'Human-readable name for the wallet' })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({ description: 'RPC endpoint URL for blockchain interactions' })
	@IsString()
	@IsNotEmpty()
	rpcEndpoint: string;

	@ApiProperty({ description: 'Indexer endpoint URL for blockchain data queries' })
	@IsString()
	@IsNotEmpty()
	indexerEndpoint: string;

	@ApiPropertyOptional({ description: 'Regular expression pattern to restrict allowed endpoints' })
	@IsOptional()
	@IsString()
	allowedEndpointsRegex?: string;

	@ApiProperty({ description: 'BIP39 mnemonic (English word list) from which the actor identities are derived' })
	@IsString()
	@IsNotEmpty()
	actorPassphrase: string;

	@ApiProperty({
		description:
			'Private key of the wallet: { keyType: "SEED", schemeId, seed, passphrase? } or { keyType: "JWK", jwk }. Validated by PrivateKeyService.',
	})
	@IsObject()
	privateKey: unknown;
}
