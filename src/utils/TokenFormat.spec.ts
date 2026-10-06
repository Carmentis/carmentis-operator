import { formatAtomicsAsCmts } from './TokenFormat';

describe('formatAtomicsAsCmts', () => {
	it.each([
		[0, '0 CMTS'],
		[42, '0.00042 CMTS'],
		[100000, '1 CMTS'],
		[99999999, '999.99999 CMTS'],
		[100000000, '1,000 CMTS'],
		[1147189900158, '11,471,899.00158 CMTS'],
		[123456789012345, '1,234,567,890.12345 CMTS'],
	])('%d atomics -> %s', (atomics, expected) => {
		expect(formatAtomicsAsCmts(atomics)).toBe(expected);
	});
});
