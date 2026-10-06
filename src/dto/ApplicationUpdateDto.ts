import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Local description of an application. `vbId`, `wallet` and `organization` are intentionally
 * not editable here: `vbId` is the application's identity (its virtual blockchain id), `wallet`
 * is whichever wallet is authorized to sign that virtual blockchain's history and
 * `organization` is fixed by its on-chain creation — changing any of them after creation would
 * silently reinterpret already-anchored history.
 */
export class ApplicationUpdateDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	homepageUrl?: string;

	@IsOptional()
	@IsString()
	logoUrl?: string;
}
