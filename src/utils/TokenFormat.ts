import { CMTSToken } from '@cmts-dev/carmentis-sdk-core';

/**
 * Formats an amount of atomic units for display: in CMTS, with the thousands grouped
 * (`11,471,899.00158 CMTS`). The locale is fixed so that the output does not depend on the
 * machine running the operator.
 */
export function formatAtomicsAsCmts(atomics: number): string {
	return CMTSToken.createAtomic(atomics).toString(undefined, { grouping: true, locale: 'en-US' });
}
