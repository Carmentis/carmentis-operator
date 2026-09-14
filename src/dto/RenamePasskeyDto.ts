import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RenamePasskeyDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(64)
	readonly name: string;
}
