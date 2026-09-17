import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RenamePseudoDto {
	@IsString()
	@IsNotEmpty()
	@Length(2, 32)
	@Matches(/^[\p{L}\p{N} _-]+$/u, {
		message: 'pseudo may only contain letters, numbers, spaces, underscores and hyphens',
	})
	readonly pseudo: string;
}
