import { IsDecimal, IsDefined, IsNotEmpty, IsObject, IsString } from 'class-validator';

/**
 * The result of a Carmentis Desk exchange, as posted back by the browser:
 * the challenge the server issued, and the `{ publicKey, signature }` pair returned by Desk.
 */
export class DeskAuthVerifyDto {
	@IsString()
	@IsNotEmpty()
	readonly challenge: string;

	@IsString()
	@IsNotEmpty()
	readonly publicKey: string;

	@IsString()
	@IsNotEmpty()
	readonly signature: string;

	@IsObject()
	@IsDefined()
	readonly payload: object;
}
