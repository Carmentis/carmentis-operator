import { IsNotEmpty, IsString } from 'class-validator';

export class SetupFirstUserDto {
	@IsString()
	@IsNotEmpty()
	readonly publicKey: string;

	@IsString()
	@IsNotEmpty()
	readonly pseudo: string;
}
