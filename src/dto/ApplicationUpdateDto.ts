import { IsNotEmpty, IsString } from 'class-validator';

/**
 * `vbId` and `wallet` are intentionally not editable here: `vbId` is the application's
 * identity (its virtual blockchain id, obtained out-of-band) and `wallet` is whichever
 * wallet is authorized to sign that virtual blockchain's history — changing either after
 * creation would silently reinterpret already-anchored history. Only `name` is safe to edit.
 */
export class ApplicationUpdateDto {
	@IsString()
	@IsNotEmpty()
	name: string;
}
