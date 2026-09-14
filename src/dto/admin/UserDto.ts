import { Expose } from 'class-transformer';

export class UserDto {
	@Expose()
	id: number;

	@Expose()
	pseudo: string;

	@Expose()
	email?: string;

	@Expose()
	createdAt: Date;
}
