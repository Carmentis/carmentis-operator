import { IsBoolean, IsInt } from 'class-validator';

export class UpdateAccessRightDto {
	@IsInt()
	id: number;

	@IsBoolean()
	isAdmin: boolean;

	@IsBoolean()
	editUsers: boolean;

	@IsBoolean()
	editApplications: boolean;

	@IsBoolean()
	editOracles: boolean;

}
