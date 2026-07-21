import { IsHexadecimal, IsISO8601, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Request DTO for creating a new API key.
 * API keys are used to authenticate API requests and can have various restrictions:
 * - Endpoint regex: limit which API endpoints can be accessed
 * - Gas price limits: restrict the gas price range for blockchain transactions
 * - Application binding: optionally tie the key to a specific application
 *
 * @example
 * {
 *   "name": "Production API Key",
 *   "applicationVbId": "app123",
 *   "endpointRegex": "^/api/anchor.*",
 *   "gasMinAtomics": 0,
 *   "gasMaxAtomics": 1000000000000000000
 * }
 */
export class ApiKeyCreationDto {
	@ApiProperty({
		description: 'Human-readable name for this API key. Used for identification and logging',
		example: 'Production API Key'
	})
	@IsString()
	name: string;

	@ApiPropertyOptional({
		description: 'ISO 8601 timestamp after which this API key will be considered inactive. If omitted, the key never expires',
		example: '2025-12-31T23:59:59Z'
	})
	@IsOptional()
	@IsISO8601()
	activeUntil?: string;

	@ApiPropertyOptional({
		description: 'Virtual Blockchain ID of the application this key is associated with. If omitted, the key is not tied to any specific application',
		example: 'app123'
	})
	@IsOptional()
	@IsHexadecimal()
	applicationVbId?: string;

	@ApiPropertyOptional({
		description: 'ID of the wallet this key is associated with. If omitted, the key is not tied to any specific wallet',
		example: 1
	})
	@IsOptional()
	@IsNumber()
	walletId?: number;

	@ApiPropertyOptional({
		description: 'Regular expression pattern to restrict which API endpoints this key can access. If omitted, all endpoints are allowed. Example: "^/api/(anchor|wallet)/.*" restricts to anchor and wallet endpoints',
		example: '^/api/anchor.*'
	})
	@IsOptional()
	@IsString()
	endpointRegex?: string;

	@ApiPropertyOptional({
		description: 'Minimum gas price in atomic units (1 CMTS = 10^18 atomics) for blockchain transactions using this key',
		default: 0,
		example: 0
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	gasMinAtomics?: number;

	@ApiPropertyOptional({
		description: 'Maximum gas price in atomic units (1 CMTS = 10^18 atomics) for blockchain transactions using this key',
		default: 1000000,
		example: 1000000000000000000
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	gasMaxAtomics?: number;
}