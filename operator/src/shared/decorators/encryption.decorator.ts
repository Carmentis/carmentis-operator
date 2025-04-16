import { Column, ColumnOptions } from 'typeorm';
import { EncryptionServiceProxy } from '../encryption.singleton';
import { EncryptionTransformer } from '../transformers/encryption.transformer';


export function EncryptedColumn(options: ColumnOptions = {}) {
	return Column({
		type: 'text',
		transformer: new EncryptionTransformer(() => EncryptionServiceProxy.instance),
		...options,
	});
}