import { useAtomValue } from 'jotai';
import { oracleEnumerationAtom } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/atoms';
import {
	EnumerationsView
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/enumerations-panel';
import { useEnumerationEdition } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/atom-logic';

export default function EnumerationsPanel() {
	const enumerations = useAtomValue(oracleEnumerationAtom);
	const edition = useEnumerationEdition();

	return <EnumerationsView
		enumerations={enumerations}
		{...edition}
	/>
}
