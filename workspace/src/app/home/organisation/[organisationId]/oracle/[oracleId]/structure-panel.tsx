import { StructuresView } from '@/app/home/organisation/[organisationId]/application/[applicationId]/structures-panel';
import { useAtomValue } from 'jotai';
import { oracleStructureAtom } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/atoms';
import { useStructEdition } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/atom-logic';

export default
function StructurePanel() {
	const structures = useAtomValue(oracleStructureAtom);
	const edition = useStructEdition();

	return <StructuresView
		structures={structures}
		{...edition}
	/>
}
