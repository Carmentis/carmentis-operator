import { Column, ColumnOptions } from 'typeorm';
import { EncryptionServiceProxy } from '../EncryptionServiceProxy';
import { EncryptionTransformer } from '../transformers/EncryptionTransformer';

/**
 * Creates and returns a column definition for encrypted data.
 * The encryption transformer is automatically applied to handle encryption and decryption.
 *
 * @param {ColumnOptions} [options={}] - The optional configuration for the column, such as type, length, default value, or other database-specific settings. Defaults to an empty object.
 * @return {any} The configured column definition with encryption transformation functionality.
 */
export function EncryptedColumn(options: ColumnOptions = {}) {
	return Column({
		type: 'text',
		transformer: new EncryptionTransformer(() => EncryptionServiceProxy.instance),
		...options,
	});
}