import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class AdministrationService {
	constructor(private dataSource: DataSource) {}

	async createAdministrator(admin: UserEntity) {
		const queryRunner = this.dataSource.createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			await queryRunner.manager.save(admin);

			await queryRunner.commitTransaction();
		} catch (err) {
			console.error(err);
			// since we have errors lets rollback the changes we made
			await queryRunner.rollbackTransaction();
		} finally {
			// you need to release a queryRunner which was manually instantiated
			await queryRunner.release();
		}
	}
}