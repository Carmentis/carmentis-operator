import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Table, TableColumn, TableForeignKey } from 'typeorm';

/**
 * Moves the wallet secret out of `wallet.seed` into a dedicated, encrypted `private_key`
 * table (seed-based or JWK), and adds the mandatory encrypted `actorPassphrase` used to
 * derive actor identities. A private key may be shared by several wallets.
 *
 * IMPORTANT / destructive: a seed-based wallet cannot be mapped to a `private_key` row
 * without decrypting `seed` in SQL, and `actorPassphrase` did not exist before, so existing
 * wallets are deleted (the project had none at the time of this migration). Wallets that were
 * linked to applications or API keys must be re-created, then the dependents re-linked.
 *
 * As for the other migrations, the project still runs with `synchronize: true`, so this is
 * the reviewable artifact for environments that disable it. Column types stay portable
 * across postgres/mysql/sqlite.
 */
export class WalletPrivateKey1789600000000 implements MigrationInterface {
	name = 'WalletPrivateKey1789600000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'private_key',
				columns: [
					{ name: 'id', type: 'varchar', length: '36', isPrimary: true },
					{ name: 'privateKey', type: 'text' },
					{ name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
				],
			}),
			true,
		);

		await queryRunner.query('DELETE FROM "wallet"');

		const walletTable = await queryRunner.getTable('wallet');
		for (const legacyColumn of ['seed', 'signatureSchemeId', 'publicKeyEncryptionSchemeId']) {
			const column = walletTable?.findColumnByName(legacyColumn);
			if (column) {
				await queryRunner.dropColumn('wallet', column);
			}
		}

		const addMissing = async (column: TableColumn) => {
			const table = await queryRunner.getTable('wallet');
			if (!table?.findColumnByName(column.name)) {
				await queryRunner.addColumn('wallet', column);
			}
		};
		await addMissing(new TableColumn({ name: 'actorPassphrase', type: 'text' }));
		await addMissing(new TableColumn({ name: 'actorSignatureSchemeId', type: 'int', default: 0 }));
		await addMissing(new TableColumn({ name: 'actorPublicKeyEncryptionSchemeId', type: 'int', default: 0 }));
		await addMissing(new TableColumn({ name: 'privateKeyId', type: 'varchar', length: '36' }));

		await queryRunner.createForeignKey(
			'wallet',
			new TableForeignKey({
				columnNames: ['privateKeyId'],
				referencedTableName: 'private_key',
				referencedColumnNames: ['id'],
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const walletTable = await queryRunner.getTable('wallet');
		const foreignKey = walletTable?.foreignKeys.find(fk => fk.columnNames.includes('privateKeyId'));
		if (foreignKey) {
			await queryRunner.dropForeignKey('wallet', foreignKey);
		}
		await queryRunner.dropColumn('wallet', 'privateKeyId');
		await queryRunner.dropColumn('wallet', 'actorPassphrase');
		await queryRunner.dropTable('private_key', true);
		await queryRunner.addColumn('wallet', new TableColumn({ name: 'seed', type: 'text', default: "''" }));
	}
}
