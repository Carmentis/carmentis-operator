import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Table, TableColumn } from 'typeorm';

/**
 * Replaces passkey (WebAuthn/FIDO2) authentication with Carmentis Desk wallet authentication.
 * Identity becomes the wallet's public key instead of a set of registered credentials; the
 * invitation system is unchanged.
 *
 * IMPORTANT / destructive: existing WebAuthn-authenticated accounts have no public key and
 * cannot be mapped to one, so this migration deletes all rows from `user` before adding the
 * now-mandatory `publicKey` column. There is no way to recover those accounts; anyone who needs
 * access afterwards must go through `/admin/setup` (if no user exists) or a fresh invitation.
 *
 * Column types are chosen to be portable across the three supported drivers
 * (postgres/mysql/sqlite) rather than using driver-specific native types (e.g. no native
 * `uuid` column type is used). Note that as of this migration the project still runs with
 * `synchronize: true` (see `src/database/getDatabaseConfig.ts`), so in practice schema
 * changes are applied automatically on boot; this migration is provided as a correct,
 * reviewable artifact for any environment that disables `synchronize`.
 */
export class CarmentisDeskAuth1789458303519 implements MigrationInterface {
	name = 'CarmentisDeskAuth1789458303519';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('user_credential', true);
		await queryRunner.dropTable('webauthn_challenge', true);

		await queryRunner.createTable(
			new Table({
				name: 'desk_auth_challenge',
				columns: [
					{ name: 'id', type: 'varchar', length: '36', isPrimary: true },
					{ name: 'challenge', type: 'varchar', length: '512', isUnique: true },
					{ name: 'consumed', type: 'boolean', default: false },
					{ name: 'expiresAt', type: 'timestamp' },
					{ name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
				],
			}),
			true,
		);

		// No cryptographic identity survives the switch from passkeys to wallet public keys.
		await queryRunner.query('DELETE FROM "user"');

		const userTable = await queryRunner.getTable('user');
		const emailColumn = userTable?.findColumnByName('email');
		if (emailColumn) {
			await queryRunner.dropColumn('user', emailColumn);
		}

		await queryRunner.addColumn(
			'user',
			new TableColumn({ name: 'publicKey', type: 'varchar', isUnique: true }),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('user', 'publicKey');
		await queryRunner.addColumn(
			'user',
			new TableColumn({ name: 'email', type: 'varchar', isNullable: true, isUnique: true }),
		);

		await queryRunner.dropTable('desk_auth_challenge', true);

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
	}
}
