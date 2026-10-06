import { EncryptionTransformer } from './EncryptionTransformer';

describe('EncryptionTransformer', () => {
	const transformer = new EncryptionTransformer(() => ({
		encrypt: (value: string) => `enc:${value}`,
		decrypt: (value: string) => value.replace(/^enc:/, ''),
	}) as any);

	it.each(['1234', 'true', 'null', 'plain passphrase'])('round-trips the string %s unchanged', (value) => {
		expect(transformer.from(transformer.to(value)!)).toBe(value);
	});

	it('round-trips objects', () => {
		const value = { keyType: 'JWK', jwk: { kty: 'EC' } };
		expect(transformer.from(transformer.to(value)!)).toEqual(value);
	});
});
