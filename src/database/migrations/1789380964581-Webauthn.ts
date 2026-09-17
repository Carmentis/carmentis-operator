import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Table, TableColumn } from 'typeorm';

/**
 * Introduces passkey (WebAuthn/FIDO2) authentication and invitation-based registration,
 * replacing the previous password and wallet-signature admin login.
 *
 * Column types are chosen to be portable across the three supported drivers
 * (postgres/mysql/sqlite) rather than using driver-specific native types (e.g. no native
 * `uuid` column type is used). Note that as of this migration the project still runs with
 * `synchronize: true` (see `src/database/getDatabaseConfig.ts`), so in practice schema
 * changes are applied automatically on boot; this migration is provided as a correct,
 * reviewable artifact for any environment that disables `synchronize`.
 */
export class Webauthn1789380964581 implements MigrationInterface {
	name = 'Webauthn1789380964581';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'user_credential',
				columns: [
					{ name: 'id', type: 'varchar', length: '36', isPrimary: true },
					{ name: 'userId', type: 'int' },
					{ name: 'credentialId', type: 'varchar', length: '512', isUnique: true },
					{ name: 'publicKey', type: 'text' },
					{ name: 'counter', type: 'int', default: 0 },
					{ name: 'transports', type: 'text', isNullable: true },
					{ name: 'deviceType', type: 'varchar', isNullable: true },
					{ name: 'backedUp', type: 'boolean', default: false },
					{ name: 'name', type: 'varchar', isNullable: true },
					{ name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
					{ name: 'lastUsedAt', type: 'timestamp', isNullable: true },
				],
				foreignKeys: [
					{
						columnNames: ['userId'],
						referencedTableName: 'user',
						referencedColumnNames: ['id'],
						onDelete: 'CASCADE',
					},
				],
			}),
			true,
		);

		await queryRunner.createTable(
			new Table({
				name: 'invitation',
				columns: [
					{ name: 'id', type: 'varchar', length: '36', isPrimary: true },
					{ name: 'tokenHash', type: 'varchar', length: '64', isUnique: true },
					{ name: 'createdByUserId', type: 'int' },
					{ name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
					{ name: 'expiresAt', type: 'timestamp' },
					{ name: 'usedAt', type: 'timestamp', isNullable: true },
					{ name: 'usedByUserId', type: 'int', isNullable: true },
				],
				foreignKeys: [
					{
						columnNames: ['createdByUserId'],
						referencedTableName: 'user',
						referencedColumnNames: ['id'],
						onDelete: 'CASCADE',
					},
					{
						columnNames: ['usedByUserId'],
						referencedTableName: 'user',
						referencedColumnNames: ['id'],
						onDelete: 'SET NULL',
					},
				],
			}),
			true,
		);

		await queryRunner.createTable(
			new Table({
				name: 'webauthn_challenge',
				columns: [
					{ name: 'id', type: 'varchar', length: '36', isPrimary: true },
					{ name: 'challenge', type: 'varchar', length: '512', isUnique: true },
					{ name: 'purpose', type: 'varchar', length: '32' },
					{ name: 'userId', type: 'int', isNullable: true },
					{ name: 'pendingUserHandle', type: 'varchar', isNullable: true },
					{ name: 'pendingPseudo', type: 'varchar', isNullable: true },
					{ name: 'pendingEmail', type: 'varchar', isNullable: true },
					{ name: 'invitationId', type: 'varchar', length: '36', isNullable: true },
					{ name: 'consumed', type: 'boolean', default: false },
					{ name: 'expiresAt', type: 'timestamp' },
					{ name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
				],
			}),
			true,
		);

		const userTable = await queryRunner.getTable('user');
		const publicKeyColumn = userTable?.findColumnByName('publicKey');
		if (publicKeyColumn) {
			await queryRunner.dropColumn('user', publicKeyColumn);
		}
		const passwordHashColumn = userTable?.findColumnByName('passwordHash');
		if (passwordHashColumn) {
			await queryRunner.dropColumn('user', passwordHashColumn);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'user',
			new TableColumn({ name: 'passwordHash', type: 'varchar', isNullable: true }),
		);
		await queryRunner.addColumn(
			'user',
			new TableColumn({ name: 'publicKey', type: 'varchar', isNullable: true, isUnique: true }),
		);

		await queryRunner.dropTable('webauthn_challenge', true);
		await queryRunner.dropTable('invitation', true);
		await queryRunner.dropTable('user_credential', true);
	}
}
