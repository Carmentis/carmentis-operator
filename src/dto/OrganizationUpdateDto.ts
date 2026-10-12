import { IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * Local description of an organization. `wallet` is intentionally not editable: it is the
 * wallet whose account owns the organization on-chain.
 */
export class OrganizationUpdateDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	city: string;

	/** ISO 3166-1 alpha-2 country code. */
	@IsString()
	@Length(2, 2)
	countryCode: string;

	@IsString()
	@IsNotEmpty()
	website: string;
}
