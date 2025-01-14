import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	readonly publicKey: string;

	@IsString()
	@IsNotEmpty()
	readonly firstname: string;

	@IsString()
	@IsNotEmpty()
	readonly lastname: string;

	@IsBoolean()
	@IsOptional()
	readonly isAdmin: boolean;
}