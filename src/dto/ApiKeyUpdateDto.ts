import { IsHexadecimal, IsISO8601, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Editable fields for an existing API key. `apiKey` (the secret itself), `id` and
 * `createdAt` are never editable. `isActive` is intentionally excluded too: activating/
 * deactivating a key is a distinct, already-existing action (`PATCH /:id/toggle`), kept
 * separate from this general-purpose edit form.
 */
export class ApiKeyUpdateDto {
	@ApiPropertyOptional({ description: 'Human-readable name for this API key' })
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({ description: 'ISO 8601 timestamp after which this API key is considered inactive' })
	@IsOptional()
	@IsISO8601()
	activeUntil?: string;

	@ApiPropertyOptional({ description: 'Virtual Blockchain ID of the application this key is associated with, or null to unlink' })
	@IsOptional()
	@IsHexadecimal()
	applicationVbId?: string | null;

	@ApiPropertyOptional({ description: 'ID of the wallet this key is associated with, or null to unlink' })
	@IsOptional()
	@IsNumber()
	walletId?: number | null;

	@ApiPropertyOptional({ description: 'Regular expression pattern to restrict which API endpoints this key can access' })
	@IsOptional()
	@IsString()
	endpointRegex?: string;

	@ApiPropertyOptional({ description: 'Minimum gas price in atomic units' })
	@IsOptional()
	@IsNumber()
	@Min(0)
	gasMinAtomics?: number;

	@ApiPropertyOptional({ description: 'Maximum gas price in atomic units' })
	@IsOptional()
	@IsNumber()
	@Min(0)
	gasMaxAtomics?: number;
}
