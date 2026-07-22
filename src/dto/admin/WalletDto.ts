// wallet.dto.ts
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PublicKeyEncryptionSchemeId, SignatureSchemeId } from '@cmts-dev/carmentis-sdk-core';
import { IsOptional } from 'class-validator';

/**
 * DTO public du Wallet.
 *
 * Utilisé pour toutes les réponses qui exposent un wallet à l'extérieur
 * SANS le champ sensible `seed` (listing, get by id, update, replace...).
 *
 * Grâce à `excludeExtraneousValues: true` (config globale de class-transformer),
 * seuls les champs marqués `@Expose()` sont sérialisés. Tout champ de
 * `WalletEntity` non exposé ici (comme `seed`) est donc absent de la réponse.
 */
export class WalletDto {
	@ApiProperty({
		description: 'Unique identifier for the wallet',
		example: 1,
	})
	@Expose()
	id: number;

	@ApiProperty({
		description: 'Signature scheme identifier (SECP256K1)',
		example: SignatureSchemeId.SECP256K1,
	})
	@IsOptional()
	@Expose()
	signatureSchemeId: number = SignatureSchemeId.SECP256K1;

	@ApiProperty({
		description: 'Public key encryption scheme identifier (ML_KEM_768_AES_256_GCM)',
		example: PublicKeyEncryptionSchemeId.ML_KEM_768_AES_256_GCM,
	})
	@IsOptional()
	@Expose()
	publicKeyEncryptionSchemeId: number = PublicKeyEncryptionSchemeId.ML_KEM_768_AES_256_GCM;

	@ApiProperty({
		description: 'Human-readable name for the wallet',
		example: 'Administrateur Carmentis',
	})
	@Expose()
	name: string;

	@ApiProperty({
		description: 'Timestamp when the wallet was created',
		example: '2024-01-15T10:30:00.000Z',
	})
	@Expose()
	createdAt: Date;

	@ApiProperty({
		description: 'RPC endpoint URL for blockchain interactions',
		example: 'https://node2.server2.devnet.carmentis.io',
	})
	@Expose()
	rpcEndpoint: string;

	@ApiProperty({
		description: 'Indexer endpoint URL for blockchain data queries',
		example: 'https://indexer.server4.devnet.carmentis.io',
	})
	@Expose()
	indexerEndpoint: string;

	@ApiProperty({
		description: 'Regular expression pattern to restrict allowed endpoints (optional)',
		example: '^/api/.*',
		required: false,
	})
	@Expose()
	allowedEndpointsRegex?: string;

}


export class WalletWithSeedDto extends WalletDto {
	@ApiProperty({
		description: 'Seed of the wallet',
		example: 'a1b2c3d4e5f6...',
	})
	@Expose()
	seed: string;
}