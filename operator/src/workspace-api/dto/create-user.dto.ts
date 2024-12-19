import { IsNotEmpty, IsString } from 'class-validator';

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
}