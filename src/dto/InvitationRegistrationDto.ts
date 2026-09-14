import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InvitationRegistrationDto {
	@IsString()
	@IsNotEmpty()
	readonly pseudo: string;

	@IsOptional()
	@IsEmail()
	readonly email?: string;
}
