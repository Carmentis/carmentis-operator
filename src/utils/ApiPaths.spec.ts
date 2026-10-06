import { stripApiVersion } from './ApiPaths';

describe('stripApiVersion', () => {
	it.each([
		['/api/v1/anchorRequest', '/api/anchorRequest'],
		['/api/v12/wallet/3/anchor', '/api/wallet/3/anchor'],
		['/api/anchorRequest', '/api/anchorRequest'],
		['/api/v1', '/api'],
		['/api/vault', '/api/vault'],
		['/admin/v1/x', '/admin/v1/x'],
	])('%s -> %s', (input, expected) => {
		expect(stripApiVersion(input)).toBe(expected);
	});

	it('keeps existing API-key restrictions working for versioned URLs', () => {
		expect(new RegExp('^/api/anchor.*').test(stripApiVersion('/api/v1/anchorRequest'))).toBe(true);
	});
});
