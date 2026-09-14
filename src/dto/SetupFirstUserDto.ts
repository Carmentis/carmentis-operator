import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class SetupFirstUserDto {
	@IsString()
	@IsNotEmpty()
	readonly pseudo: string;

	@IsOptional()
	@IsEmail()
	readonly email?: string;
}
