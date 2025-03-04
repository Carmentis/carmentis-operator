import { useAtomValue } from 'jotai';
import { oracleMasksAtom } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/atoms';
import { useMaskEdition } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/atom-logic';
import { MasksView } from '@/app/home/organisation/[organisationId]/application/[applicationId]/masks-panel';


export default function MasksPanel() {
	const masks = useAtomValue(oracleMasksAtom);
	const edition = useMaskEdition();

	return <MasksView masks={masks} {...edition} />;
}

