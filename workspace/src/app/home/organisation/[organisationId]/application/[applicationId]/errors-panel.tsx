import { useOracleTranslationErrors } from '@/components/api.hook';
import { useOracle } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/page';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import FullPageLoadingComponent from '@/components/full-page-loading.component';
import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { referenceOracleAtom } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/atoms';

export default function ErrorsPanel(input: { context: "application" | "oracle" }) {
	const organisation = useOrganisationContext();
	const oracle = useOracle();
	const referencedOracle = useAtomValue(referenceOracleAtom);
	const {data, isLoading, error, mutate} = useOracleTranslationErrors(organisation.id, oracle.id);


	useEffect(() => {
		mutate()
	}, [referencedOracle]);

	if (isLoading) return <>Loading...</>
	if (!data || error) return <>An error occured: {error}</>
	return <>
		{data.map((value,index) =>
			<Box key={index} sx={{width: '100%', p:2, color: 'red'}} >
				{value}
			</Box>
		)}
	</>

}
