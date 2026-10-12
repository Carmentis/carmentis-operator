import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Table, TableColumn, TableForeignKey } from 'typeorm';

/**
 * Introduces the local `organization` registry and lets applications exist locally before
 * being published: `application` gets a generated `id` primary key, its `vbId` becomes a
 * nullable unique column (null = not published yet), and it now belongs to an organization.
 * `api-key.application` and `anchor_request_entity.application` are re-pointed to the new `id`
 * (`applicationId` instead of `applicationVbId`).
 *
 * IMPORTANT / destructive: the primary key of `application` changes and an application now
 * requires an organization, which existing rows cannot provide. The migration therefore
 * refuses to run if `application` or `anchor_request_entity` contain rows (the project had no
 * application when it was written): export or delete them first, then re-import the
 * applications once the migration is applied.
 *
 * As for the other migrations, the project still runs with `synchronize: true`, so this is
 * the reviewable artifact for environments that disable it. Column types stay portable
 * across postgres/mysql/sqlite.
 */
export class OrganizationsAndLocalApplications1789700000000 implements MigrationInterface {
	name = 'OrganizationsAndLocalApplications1789700000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		for (const tableName of ['application', 'anchor_request_entity']) {
			if (!(await queryRunner.hasTable(tableName))) continue;
			const [{ count }] = await queryRunner.query(`SELECT COUNT(*) AS count FROM "${tableName}"`);
			if (Number(count) > 0) {
				throw new Error(
					`Cannot migrate: table "${tableName}" contains ${count} row(s). Delete them first (see the migration's doc comment).`,
				);
			}
		}

		await this.dropApplicationReference(queryRunner, 'api-key', 'applicationVbId');
		await this.dropApplicationReference(queryRunner, 'anchor_request_entity', 'applicationVbId');
		await queryRunner.dropTable('application', true);

		await queryRunner.createTable(
			new Table({
				name: 'organization',
				columns: [
					{ name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
					{ name: 'vbId', type: 'varchar', isNullable: true, isUnique: true },
					{ name: 'name', type: 'varchar' },
					{ name: 'city', type: 'varchar', default: "''" },
					{ name: 'countryCode', type: 'varchar', default: "''" },
					{ name: 'website', type: 'varchar', default: "''" },
					{ name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
					{ name: 'walletId', type: 'int' },
				],
				foreignKeys: [
					{ columnNames: ['walletId'], referencedTableName: 'wallet', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
				],
			}),
			true,
		);

		await queryRunner.createTable(
			new Table({
				name: 'application',
				columns: [
					{ name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
					{ name: 'vbId', type: 'varchar', isNullable: true, isUnique: true },
					{ name: 'name', type: 'varchar' },
					{ name: 'description', type: 'varchar', default: "''" },
					{ name: 'homepageUrl', type: 'varchar', default: "''" },
					{ name: 'logoUrl', type: 'varchar', default: "''" },
					{ name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
					{ name: 'walletId', type: 'int' },
					{ name: 'organizationId', type: 'int' },
				],
				foreignKeys: [
					{ columnNames: ['walletId'], referencedTableName: 'wallet', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
					{ columnNames: ['organizationId'], referencedTableName: 'organization', referencedColumnNames: ['id'] },
				],
			}),
			true,
		);

		await this.addApplicationReference(queryRunner, 'api-key', true);
		await this.addApplicationReference(queryRunner, 'anchor_request_entity', false);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await this.dropApplicationReference(queryRunner, 'api-key', 'applicationId');
		await this.dropApplicationReference(queryRunner, 'anchor_request_entity', 'applicationId');
		await queryRunner.dropTable('application', true);
		await queryRunner.dropTable('organization', true);

		await queryRunner.createTable(
			new Table({
				name: 'application',
				columns: [
					{ name: 'vbId', type: 'varchar', isPrimary: true },
					{ name: 'name', type: 'varchar' },
					{ name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
					{ name: 'walletId', type: 'int' },
				],
				foreignKeys: [
					{ columnNames: ['walletId'], referencedTableName: 'wallet', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
				],
			}),
			true,
		);
		await this.addApplicationReference(queryRunner, 'api-key', true, 'applicationVbId', 'varchar', 'vbId');
		await this.addApplicationReference(queryRunner, 'anchor_request_entity', false, 'applicationVbId', 'varchar', 'vbId');
	}

	private async dropApplicationReference(queryRunner: QueryRunner, tableName: string, columnName: string) {
		const table = await queryRunner.getTable(tableName);
		if (!table) return;
		const foreignKey = table.foreignKeys.find(fk => fk.columnNames.includes(columnName));
		if (foreignKey) {
			await queryRunner.dropForeignKey(tableName, foreignKey);
		}
		if (table.findColumnByName(columnName)) {
			await queryRunner.dropColumn(tableName, columnName);
		}
	}

	private async addApplicationReference(
		queryRunner: QueryRunner,
		tableName: string,
		nullable: boolean,
		columnName = 'applicationId',
		columnType = 'int',
		referencedColumn = 'id',
	) {
		if (!(await queryRunner.hasTable(tableName))) return;
		await queryRunner.addColumn(tableName, new TableColumn({ name: columnName, type: columnType, isNullable: nullable }));
		await queryRunner.createForeignKey(
			tableName,
			new TableForeignKey({
				columnNames: [columnName],
				referencedTableName: 'application',
				referencedColumnNames: [referencedColumn],
				onDelete: 'CASCADE',
			}),
		);
	}
}
