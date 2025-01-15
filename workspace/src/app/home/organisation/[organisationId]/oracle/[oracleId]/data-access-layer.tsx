import { Oracle } from '@/entities/oracle.entity';
import { useOracleStoreContext } from '@/contexts/oralce-store.context';
import { useEditionStatusContext } from '@/contexts/edition-status.context';
import { OracleEditor } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/oracle-editor';
import { useParams } from 'next/navigation';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import { useFetchOracleInOrganisation } from '@/components/api.hook';
import { PropsWithChildren, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';

export function useOracle() : Oracle {
	const context = useOracleStoreContext();
	if (context.oracle === undefined) throw new Error('Cannot access undefined oracle')
	return context.oracle;
};

export const useOracleEditor = () => {
	const statusContext = useEditionStatusContext();
	const context = useOracleStoreContext();
	return (cb: (editor: OracleEditor) => void) => {
		statusContext.setIsModified(true);
		context.setOracle(oracle => {
			if (oracle === undefined) return undefined;
			const editor = new OracleEditor(oracle);
			cb(editor);
			return { ...oracle };
		});
	};
};


export function OracleDataAccess({children}: PropsWithChildren) {
	// load parameters
	const params = useParams();
	const organisation = useOrganisationContext();
	const organisationId = organisation.id;
	const oracleId = parseInt(params.oracleId as string);


	// load the oracle from the API
	const response = useFetchOracleInOrganisation(organisationId, oracleId);
	const data = response.data;
	const isLoading = response.isLoading;

	// define edition state (useful to synchronize the edition status)
	const store = useOracleStoreContext();
	const oracle = store.oracle;
	console.log("oracle", oracle)
	useEffect(() => {
		store.setOracle(data);
	}, [data]);

	// display the loading page while the request is loading
	if (!data || !oracle || isLoading) return <Skeleton count={3} />;

	return <>
		{children}
	</>;
}
